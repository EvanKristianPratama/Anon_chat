import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import type {
  ClientToServerEvents,
  ErrorCode,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@anon/contracts";
import { randomUUID } from "node:crypto";
import { UseFilters } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { env } from "../../config/env";
import { sanitize } from "../../common/sanitize.util";
import { WsExceptionFilter } from "../../common/ws-exception.filter";
import type { QueueEntry } from "../../domain/chat.types";
import { MetricsService } from "../../services/metrics.service";
import { MatchQueueService } from "../worker/match-queue.service";
import { ChatEventsService } from "./chat-events.service";
import { QueueService } from "./queue.service";
import { RoomService } from "./room.service";
import { RelayService } from "./relay.service";
import { AliasService } from "./alias.service";
import { RateLimitService } from "./rate-limit.service";

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  transports: ["websocket"],
  cors: { origin: env.corsOrigin },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: TypedServer;

  constructor(
    private readonly events: ChatEventsService,
    private readonly queue: QueueService,
    private readonly rooms: RoomService,
    private readonly relay: RelayService,
    private readonly aliases: AliasService,
    private readonly matchQueue: MatchQueueService,
    private readonly metrics: MetricsService,
    private readonly rateLimit: RateLimitService,
  ) { }

  afterInit(server: TypedServer): void {
    this.events.setServer(server);
  }

  async handleConnection(socket: TypedSocket): Promise<void> {
    socket.data.userId = randomUUID();
    socket.data.ip = extractIp(socket);
    await this.metrics.onUserConnected();
  }

  async handleDisconnect(socket: TypedSocket): Promise<void> {
    await this.metrics.onUserDisconnected();
    await this.queue.removeUser(socket.data.userId);

    const ended = await this.rooms.disconnect(socket.data.userId);
    if (!ended) return;

    const partnerSocketId = this.rooms.resolvePartnerSocket(ended.room, socket.data.userId);
    this.events.emitToSocket(partnerSocketId, "room:ended", { reason: "disconnect" });
  }

  // ── Queue ──────────────────────────────────────────────

  @SubscribeMessage("queue:join")
  async onJoinQueue(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody() payload: { alias?: string },
  ): Promise<void> {
    if (!(await this.rateLimit.allow(socket.data.ip, "queue_join", 5, 10))) {
      return this.emitError(socket, "RATE_LIMITED", "Too many queue requests.");
    }

    // Save alias if provided
    if (payload?.alias) {
      const saved = await this.aliases.save(socket.data.userId, payload.alias);
      if (saved) socket.data.alias = saved;
    }

    await this.joinQueue(socket);
  }

  // ── Chat ───────────────────────────────────────────────

  @SubscribeMessage("chat:text")
  async onText(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody() payload: { text: string },
  ): Promise<void> {
    if (!(await this.rateLimit.allow(socket.data.ip, "chat_text", 25, 5))) {
      return this.emitError(socket, "RATE_LIMITED", "Message rate limit exceeded.");
    }

    if (!payload || typeof payload.text !== "string") {
      return this.emitError(socket, "BAD_REQUEST", "Invalid message payload.");
    }

    const text = sanitize(payload.text.trim());
    if (text.length === 0) return;

    if (text.length > env.maxMessageLength) {
      return this.emitError(socket, "MESSAGE_TOO_LONG", `Max length is ${env.maxMessageLength}.`);
    }

    const result = await this.relay.text(socket.data.userId, text, socket.data.alias);
    if (!result) {
      return this.emitError(socket, "NOT_IN_ROOM", "You are not in an active room.");
    }

    this.events.emitToSocket(result.partnerSocketId, "chat:text", result.payload);
  }

  @SubscribeMessage("chat:image")
  async onImage(
    @ConnectedSocket() socket: TypedSocket,
    @MessageBody() payload: { mime: "image/jpeg" | "image/png" | "image/webp"; bytes: ArrayBuffer | Uint8Array },
  ): Promise<void> {
    if (!(await this.rateLimit.allow(socket.data.ip, "chat_image", 3, 5))) {
      return this.emitError(socket, "RATE_LIMITED", "Image rate limit exceeded.");
    }

    if (!payload || !ALLOWED_IMAGE_MIME.has(payload.mime)) {
      return this.emitError(socket, "UNSUPPORTED_IMAGE", "Supported types: jpeg, png, webp.");
    }

    const bytes = normalizeBytes(payload.bytes);
    if (!bytes) {
      return this.emitError(socket, "BAD_REQUEST", "Invalid image bytes.");
    }

    if (bytes.byteLength > env.maxImageBytes) {
      return this.emitError(socket, "IMAGE_TOO_LARGE", `Max size is ${env.maxImageBytes} bytes.`);
    }

    const result = await this.relay.image(socket.data.userId, payload.mime, bytes, socket.data.alias);
    if (!result) {
      return this.emitError(socket, "NOT_IN_ROOM", "You are not in an active room.");
    }

    this.events.emitToSocket(result.partnerSocketId, "chat:image", result.payload);
  }

  // ── Room controls ──────────────────────────────────────

  @SubscribeMessage("room:skip")
  async onSkip(@ConnectedSocket() socket: TypedSocket): Promise<void> {
    if (!(await this.rateLimit.allow(socket.data.ip, "room_skip", 5, 10))) {
      return this.emitError(socket, "RATE_LIMITED", "Skip rate limit exceeded.");
    }

    const ended = await this.rooms.endByUser(socket.data.userId, "skip");
    if (ended) {
      const partnerSocketId = this.rooms.resolvePartnerSocket(ended.room, socket.data.userId);
      this.events.emitToSocket(partnerSocketId, "room:ended", { reason: "skip" });
    }

    await this.joinQueue(socket);
  }

  @SubscribeMessage("room:stay")
  async onStay(@ConnectedSocket() socket: TypedSocket): Promise<void> {
    const inRoom = await this.rooms.findByUser(socket.data.userId);
    if (inRoom) return;

    await this.joinQueue(socket);
  }

  @SubscribeMessage("session:heartbeat")
  async onHeartbeat(@ConnectedSocket() socket: TypedSocket): Promise<void> {
    await this.rooms.touch(socket.data.userId);
  }

  // ── Helpers ────────────────────────────────────────────

  private async joinQueue(socket: TypedSocket): Promise<void> {
    const entry: QueueEntry = {
      userId: socket.data.userId,
      socketId: socket.id,
      enqueuedAt: Date.now(),
    };

    const queued = await this.queue.enqueue(entry);
    socket.emit("queue:waiting");

    if (queued) {
      await this.matchQueue.enqueueMatchAttempt();
    }
  }

  private emitError(socket: TypedSocket, code: ErrorCode, message: string): void {
    socket.emit("system:error", { code, message });
  }
}

// ── Pure helpers (no `this`) ─────────────────────────────

function extractIp(socket: TypedSocket): string {
  const forwarded = socket.handshake.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return socket.handshake.address || "0.0.0.0";
}

function normalizeBytes(input: ArrayBuffer | Uint8Array): Uint8Array | null {
  if (input instanceof Uint8Array) return input;
  if (input instanceof ArrayBuffer) return new Uint8Array(input);
  return null;
}
