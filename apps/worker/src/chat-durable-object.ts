import { ChatState } from "./chat-state";
import { createChatConfig } from "./config";
import { parseChatImagePayload, parseChatTextPayload, parseQueueJoinPayload } from "./payload-parsers";
import { emit, emitSystemError, parseEnvelope, safeClose } from "./protocol";
import { InMemoryRateLimiter } from "./rate-limiter";
import { AdminService } from "./services/admin-service";
import { QueueService } from "./services/queue-service";
import { RoomService } from "./services/room-service";
import { base64ByteLength, normalizeAlias, sanitizeText } from "./utils";
import { ALLOWED_IMAGE_MIME, type Env, type UserSession } from "./types";

export class ChatDurableObject {
  private readonly chatState = new ChatState();
  private readonly config;
  private readonly rateLimiter = new InMemoryRateLimiter();

  private readonly adminService: AdminService;
  private readonly roomService: RoomService;
  private readonly queueService: QueueService;

  constructor(
    private readonly state: unknown,
    private readonly env: Env
  ) {
    this.config = createChatConfig(env);
    this.roomService = new RoomService(this.chatState, this.config);
    this.queueService = new QueueService(this.chatState, this.roomService);
    this.adminService = new AdminService(this.chatState, this.config);

    setInterval(() => {
      this.roomService.sweepExpired();
      this.adminService.broadcastMetrics();
    }, 2_000);
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Expected websocket upgrade", { status: 426 });
    }

    const role = request.headers.get("x-role") === "admin" ? "admin" : "user";
    const ip = request.headers.get("x-client-ip") ?? "0.0.0.0";

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();

    if (role === "admin") {
      this.acceptAdmin(server);
    } else {
      this.acceptUser(server, ip);
    }

    return new Response(null, {
      status: 101,
      webSocket: client
    } as ResponseInit & { webSocket: WebSocket });
  }

  private acceptAdmin(socket: WebSocket): void {
    const adminId = this.adminService.connect(socket);

    socket.addEventListener("message", (event) => {
      this.adminService.handleMessage(adminId, event.data);
    });

    socket.addEventListener("close", () => {
      this.adminService.disconnect(adminId);
    });

    socket.addEventListener("error", () => {
      this.adminService.disconnect(adminId);
      safeClose(socket);
    });
  }

  private acceptUser(socket: WebSocket, ip: string): void {
    const userId = crypto.randomUUID();
    this.chatState.users.set(userId, {
      userId,
      socket,
      ip
    });
    this.chatState.markUserConnected();
    this.adminService.broadcastMetrics();

    socket.addEventListener("message", (event) => {
      this.onUserMessage(userId, event.data);
    });

    socket.addEventListener("close", () => {
      this.disconnectUser(userId);
    });

    socket.addEventListener("error", () => {
      this.disconnectUser(userId);
      safeClose(socket);
    });
  }

  private onUserMessage(userId: string, raw: unknown): void {
    const user = this.chatState.users.get(userId);
    if (!user) {
      return;
    }

    const envelope = parseEnvelope(raw);
    if (!envelope) {
      emitSystemError(user.socket, "BAD_REQUEST", "Invalid payload.");
      return;
    }

    switch (envelope.event) {
      case "queue:join":
        this.handleQueueJoin(user, envelope.payload);
        return;
      case "room:skip":
        this.handleRoomSkip(user);
        return;
      case "room:stay":
        this.handleRoomStay(user);
        return;
      case "session:heartbeat":
        this.roomService.touchByUser(user.userId);
        return;
      case "chat:text":
        this.handleChatText(user, envelope.payload);
        return;
      case "chat:image":
        this.handleChatImage(user, envelope.payload);
        return;
      default:
        emitSystemError(user.socket, "BAD_REQUEST", "Unsupported event.");
    }
  }

  private handleQueueJoin(user: UserSession, rawPayload: unknown): void {
    if (!this.rateLimiter.allow(user.ip, "queue_join", 5, 10)) {
      emitSystemError(user.socket, "RATE_LIMITED", "Too many queue requests.");
      return;
    }

    const payload = parseQueueJoinPayload(rawPayload);
    if (payload?.alias) {
      const alias = normalizeAlias(payload.alias);
      if (alias) {
        user.alias = alias;
      }
    }

    const matched = this.enqueueAndMatch(user);
    if (matched) {
      this.adminService.broadcastMetrics();
    }
  }

  private handleRoomSkip(user: UserSession): void {
    if (!this.rateLimiter.allow(user.ip, "room_skip", 5, 10)) {
      emitSystemError(user.socket, "RATE_LIMITED", "Skip rate limit exceeded.");
      return;
    }

    const ended = this.roomService.endByUser(user.userId, "skip");
    const matched = this.enqueueAndMatch(user);

    if (ended || matched) {
      this.adminService.broadcastMetrics();
    }
  }

  private handleRoomStay(user: UserSession): void {
    if (user.roomId) {
      return;
    }

    const matched = this.enqueueAndMatch(user);
    if (matched) {
      this.adminService.broadcastMetrics();
    }
  }

  private handleChatText(user: UserSession, rawPayload: unknown): void {
    if (!this.rateLimiter.allow(user.ip, "chat_text", 25, 5)) {
      emitSystemError(user.socket, "RATE_LIMITED", "Message rate limit exceeded.");
      return;
    }

    const payload = parseChatTextPayload(rawPayload);
    if (!payload) {
      emitSystemError(user.socket, "BAD_REQUEST", "Invalid message payload.");
      return;
    }

    const text = sanitizeText(payload.text.trim());
    if (!text) {
      return;
    }

    if (text.length > this.config.maxMessageLength) {
      emitSystemError(
        user.socket,
        "MESSAGE_TOO_LONG",
        `Message max length is ${this.config.maxMessageLength}.`
      );
      return;
    }

    this.roomService.relayText(user.userId, text);
  }

  private handleChatImage(user: UserSession, rawPayload: unknown): void {
    if (!this.rateLimiter.allow(user.ip, "chat_image", 3, 5)) {
      emitSystemError(user.socket, "RATE_LIMITED", "Image rate limit exceeded.");
      return;
    }

    const payload = parseChatImagePayload(rawPayload);
    if (!payload?.mime || !ALLOWED_IMAGE_MIME.has(payload.mime)) {
      emitSystemError(user.socket, "UNSUPPORTED_IMAGE", "Supported image mime: jpeg, png, webp.");
      return;
    }

    if (!payload.data || typeof payload.data !== "string") {
      emitSystemError(user.socket, "BAD_REQUEST", "Invalid image payload.");
      return;
    }

    const imageSize = base64ByteLength(payload.data);
    if (imageSize > this.config.maxImageBytes) {
      emitSystemError(
        user.socket,
        "IMAGE_TOO_LARGE",
        `Image max size is ${this.config.maxImageBytes} bytes.`
      );
      return;
    }

    this.roomService.relayImage(user.userId, payload.mime, payload.data);
  }

  private enqueueAndMatch(user: UserSession): boolean {
    if (user.roomId) {
      emitSystemError(user.socket, "BAD_REQUEST", "Leave the active room before joining queue.");
      return false;
    }

    this.queueService.enqueue(user.userId);
    emit(user.socket, "queue:waiting");

    const matches = this.queueService.createMatches();
    if (matches.length === 0) {
      return false;
    }

    for (const match of matches) {
      emit(match.first.socket, "room:matched", {
        roomId: match.room.roomId,
        partnerId: match.second.userId,
        partnerAlias: match.second.alias
      });

      emit(match.second.socket, "room:matched", {
        roomId: match.room.roomId,
        partnerId: match.first.userId,
        partnerAlias: match.first.alias
      });
    }

    return true;
  }

  private disconnectUser(userId: string): void {
    const user = this.chatState.users.get(userId);
    if (!user) {
      return;
    }

    this.roomService.endByUser(userId, "disconnect");
    this.queueService.remove(userId);
    this.chatState.users.delete(userId);
    this.adminService.broadcastMetrics();
  }
}
