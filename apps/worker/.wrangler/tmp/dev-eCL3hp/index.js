var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/config.ts
var parseNumber = /* @__PURE__ */ __name((value, fallback) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}, "parseNumber");
var createChatConfig = /* @__PURE__ */ __name((env) => {
  return {
    adminToken: env.ADMIN_TOKEN ?? "dev-admin-token",
    maxMessageLength: parseNumber(env.MAX_MESSAGE_LENGTH, 500),
    maxImageBytes: parseNumber(env.MAX_IMAGE_BYTES, 1e6),
    idleTimeoutMs: parseNumber(env.IDLE_TIMEOUT_SEC, 60) * 1e3,
    maxSessionMs: parseNumber(env.MAX_SESSION_SEC, 900) * 1e3
  };
}, "createChatConfig");
var resolveCorsOrigin = /* @__PURE__ */ __name((env) => env.CORS_ORIGIN ?? "*", "resolveCorsOrigin");

// src/http-gateway.ts
var USER_SOCKET_PATH = "/ws";
var ADMIN_SOCKET_PATH = "/admin/ws";
var withCorsHeaders = /* @__PURE__ */ __name((corsOrigin) => ({
  "Access-Control-Allow-Origin": corsOrigin
}), "withCorsHeaders");
var createPreflightResponse = /* @__PURE__ */ __name((corsOrigin) => new Response(null, {
  status: 204,
  headers: {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  }
}), "createPreflightResponse");
var createHealthResponse = /* @__PURE__ */ __name((corsOrigin) => Response.json(
  {
    ok: true,
    at: Date.now()
  },
  {
    headers: withCorsHeaders(corsOrigin)
  }
), "createHealthResponse");
var isChatSocketPath = /* @__PURE__ */ __name((pathname) => {
  return pathname === USER_SOCKET_PATH || pathname === ADMIN_SOCKET_PATH;
}, "isChatSocketPath");
var handleEdgeRequest = /* @__PURE__ */ __name(async (request, env) => {
  const url = new URL(request.url);
  const corsOrigin = resolveCorsOrigin(env);
  if (request.method === "OPTIONS") {
    return createPreflightResponse(corsOrigin);
  }
  if (url.pathname === "/" || url.pathname === "/health") {
    return createHealthResponse(corsOrigin);
  }
  if (!isChatSocketPath(url.pathname)) {
    return new Response("Not Found", { status: 404 });
  }
  if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return new Response("Expected websocket upgrade", { status: 426 });
  }
  const role = url.pathname === ADMIN_SOCKET_PATH ? "admin" : "user";
  const doId = env.CHAT_DO.idFromName("global-chat");
  const stub = env.CHAT_DO.get(doId);
  const proxiedHeaders = new Headers(request.headers);
  proxiedHeaders.set("x-role", role);
  proxiedHeaders.set("x-client-ip", request.headers.get("CF-Connecting-IP") ?? "0.0.0.0");
  const proxiedRequest = new Request("https://do.internal/connect", {
    method: "GET",
    headers: proxiedHeaders
  });
  return stub.fetch(proxiedRequest);
}, "handleEdgeRequest");

// src/chat-state.ts
var ChatState = class {
  static {
    __name(this, "ChatState");
  }
  users = /* @__PURE__ */ new Map();
  admins = /* @__PURE__ */ new Map();
  rooms = /* @__PURE__ */ new Map();
  waitingQueue = [];
  waitingMembers = /* @__PURE__ */ new Set();
  sessionDurationSumSec = 0;
  sessionCount = 0;
  peakOnlineUsers = 0;
  markUserConnected() {
    if (this.users.size > this.peakOnlineUsers) {
      this.peakOnlineUsers = this.users.size;
    }
  }
  recordSessionDurationSec(durationSec) {
    this.sessionDurationSumSec += Math.max(0, durationSec);
    this.sessionCount += 1;
  }
  snapshotAdminMetrics() {
    return {
      onlineUsers: this.users.size,
      activeRooms: this.rooms.size,
      avgSessionDurationSec: this.sessionCount > 0 ? this.sessionDurationSumSec / this.sessionCount : 0,
      peakOnlineUsers: this.peakOnlineUsers,
      at: Date.now()
    };
  }
};

// src/utils.ts
var sanitizeText = /* @__PURE__ */ __name((value) => value.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, ""), "sanitizeText");
var normalizeAlias = /* @__PURE__ */ __name((value) => {
  const normalized = sanitizeText(value.trim().replace(/\s+/g, " ").slice(0, 24));
  return normalized.length >= 2 ? normalized : null;
}, "normalizeAlias");
var base64ByteLength = /* @__PURE__ */ __name((raw) => {
  const base64 = raw.includes(",") ? raw.split(",").pop() ?? "" : raw;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor(base64.length * 3 / 4) - padding;
}, "base64ByteLength");
var isObjectRecord = /* @__PURE__ */ __name((value) => {
  return typeof value === "object" && value !== null;
}, "isObjectRecord");

// src/payload-parsers.ts
var parseQueueJoinPayload = /* @__PURE__ */ __name((rawPayload) => {
  if (!isObjectRecord(rawPayload)) {
    return null;
  }
  if ("alias" in rawPayload && typeof rawPayload.alias !== "string") {
    return null;
  }
  return rawPayload;
}, "parseQueueJoinPayload");
var parseChatTextPayload = /* @__PURE__ */ __name((rawPayload) => {
  if (!isObjectRecord(rawPayload)) {
    return null;
  }
  if (typeof rawPayload.text !== "string") {
    return null;
  }
  return rawPayload;
}, "parseChatTextPayload");
var parseChatImagePayload = /* @__PURE__ */ __name((rawPayload) => {
  if (!isObjectRecord(rawPayload)) {
    return null;
  }
  const mime = rawPayload.mime;
  const data = rawPayload.data;
  if (mime !== void 0 && typeof mime !== "string") {
    return null;
  }
  if (data !== void 0 && typeof data !== "string") {
    return null;
  }
  return rawPayload;
}, "parseChatImagePayload");
var parseAdminSubscribePayload = /* @__PURE__ */ __name((rawPayload) => {
  if (!isObjectRecord(rawPayload)) {
    return null;
  }
  if (typeof rawPayload.token !== "string") {
    return null;
  }
  return rawPayload;
}, "parseAdminSubscribePayload");

// src/protocol.ts
var parseEnvelope = /* @__PURE__ */ __name((raw) => {
  if (typeof raw !== "string") {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.event !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}, "parseEnvelope");
var safeClose = /* @__PURE__ */ __name((socket) => {
  try {
    socket.close();
  } catch {
  }
}, "safeClose");
var emit = /* @__PURE__ */ __name((socket, event, payload) => {
  try {
    socket.send(JSON.stringify({ event, payload }));
  } catch {
    safeClose(socket);
  }
}, "emit");
var emitSystemError = /* @__PURE__ */ __name((socket, code, message) => {
  emit(socket, "system:error", { code, message });
}, "emitSystemError");

// src/rate-limiter.ts
var InMemoryRateLimiter = class {
  static {
    __name(this, "InMemoryRateLimiter");
  }
  buckets = /* @__PURE__ */ new Map();
  allow(ip, action, limit, windowSec) {
    const now = Date.now();
    const bucket = Math.floor(now / (windowSec * 1e3));
    const key = `${ip}:${action}:${bucket}`;
    const current = this.buckets.get(key);
    if (!current) {
      this.buckets.set(key, {
        count: 1,
        expiresAt: now + windowSec * 1e3 + 1e3
      });
      this.gc(now);
      return true;
    }
    current.count += 1;
    this.gc(now);
    return current.count <= limit;
  }
  gc(now) {
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.expiresAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
};

// src/services/admin-service.ts
var AdminService = class {
  constructor(state, config) {
    this.state = state;
    this.config = config;
  }
  static {
    __name(this, "AdminService");
  }
  connect(socket) {
    const adminId = crypto.randomUUID();
    this.state.admins.set(adminId, {
      adminId,
      socket,
      authorized: false
    });
    return adminId;
  }
  disconnect(adminId) {
    this.state.admins.delete(adminId);
  }
  handleMessage(adminId, raw) {
    const admin = this.state.admins.get(adminId);
    if (!admin) {
      return;
    }
    const envelope = parseEnvelope(raw);
    if (!envelope) {
      emitSystemError(admin.socket, "BAD_REQUEST", "Invalid payload.");
      return;
    }
    if (envelope.event !== "admin:subscribe") {
      emitSystemError(admin.socket, "BAD_REQUEST", "Unsupported admin event.");
      return;
    }
    const payload = parseAdminSubscribePayload(envelope.payload);
    if (!payload || payload.token !== this.config.adminToken) {
      emitSystemError(admin.socket, "BAD_REQUEST", "Invalid admin token.");
      safeClose(admin.socket);
      this.disconnect(adminId);
      return;
    }
    admin.authorized = true;
    emit(admin.socket, "admin:metrics", this.state.snapshotAdminMetrics());
  }
  broadcastMetrics() {
    const payload = this.state.snapshotAdminMetrics();
    for (const admin of this.state.admins.values()) {
      if (!admin.authorized) {
        continue;
      }
      emit(admin.socket, "admin:metrics", payload);
    }
  }
};

// src/services/queue-service.ts
var QueueService = class {
  constructor(state, roomService) {
    this.state = state;
    this.roomService = roomService;
  }
  static {
    __name(this, "QueueService");
  }
  enqueue(userId) {
    if (this.state.waitingMembers.has(userId)) {
      return false;
    }
    this.state.waitingMembers.add(userId);
    this.state.waitingQueue.push(userId);
    return true;
  }
  remove(userId) {
    this.state.waitingMembers.delete(userId);
    this.removeFromQueue(userId);
  }
  createMatches() {
    const matches = [];
    while (this.state.waitingQueue.length >= 2) {
      const firstId = this.dequeueNextEligible();
      if (!firstId) {
        return matches;
      }
      const secondId = this.dequeueNextEligible();
      if (!secondId) {
        this.state.waitingMembers.add(firstId);
        this.state.waitingQueue.unshift(firstId);
        return matches;
      }
      const room = this.roomService.createRoom(firstId, secondId);
      if (!room) {
        continue;
      }
      const first = this.state.users.get(firstId);
      const second = this.state.users.get(secondId);
      if (!first || !second) {
        continue;
      }
      matches.push({ room, first, second });
    }
    return matches;
  }
  dequeueNextEligible() {
    while (this.state.waitingQueue.length > 0) {
      const userId = this.state.waitingQueue.shift();
      if (!userId) {
        return null;
      }
      if (!this.state.waitingMembers.delete(userId)) {
        continue;
      }
      const user = this.state.users.get(userId);
      if (!user || user.roomId) {
        continue;
      }
      return userId;
    }
    return null;
  }
  removeFromQueue(userId) {
    for (let index = this.state.waitingQueue.length - 1; index >= 0; index -= 1) {
      if (this.state.waitingQueue[index] === userId) {
        this.state.waitingQueue.splice(index, 1);
      }
    }
  }
};

// src/services/room-service.ts
var RoomService = class {
  constructor(state, config) {
    this.state = state;
    this.config = config;
  }
  static {
    __name(this, "RoomService");
  }
  createRoom(firstUserId, secondUserId) {
    const first = this.state.users.get(firstUserId);
    const second = this.state.users.get(secondUserId);
    if (!first || !second || first.roomId || second.roomId) {
      return null;
    }
    const roomId = crypto.randomUUID();
    const now = Date.now();
    const room = {
      roomId,
      userA: first.userId,
      userB: second.userId,
      startedAt: now,
      lastActivityAt: now
    };
    this.state.rooms.set(room.roomId, room);
    first.roomId = room.roomId;
    second.roomId = room.roomId;
    return room;
  }
  findByUser(userId) {
    const roomId = this.state.users.get(userId)?.roomId;
    if (!roomId) {
      return null;
    }
    return this.state.rooms.get(roomId) ?? null;
  }
  touchByUser(userId) {
    const room = this.findByUser(userId);
    if (room) {
      room.lastActivityAt = Date.now();
    }
  }
  relayText(fromUserId, text) {
    const relay = this.resolveRelayContext(fromUserId);
    if (!relay) {
      return;
    }
    relay.room.lastActivityAt = Date.now();
    emit(relay.partner.socket, "chat:text", {
      from: relay.fromUser.userId,
      alias: relay.fromUser.alias,
      text,
      at: Date.now()
    });
  }
  relayImage(fromUserId, mime, data) {
    const relay = this.resolveRelayContext(fromUserId);
    if (!relay) {
      return;
    }
    relay.room.lastActivityAt = Date.now();
    emit(relay.partner.socket, "chat:image", {
      from: relay.fromUser.userId,
      alias: relay.fromUser.alias,
      mime,
      data,
      at: Date.now()
    });
  }
  endByUser(userId, reason) {
    const room = this.findByUser(userId);
    if (!room) {
      return false;
    }
    return this.endById(room.roomId, reason, userId);
  }
  endById(roomId, reason, actorUserId) {
    const room = this.state.rooms.get(roomId);
    if (!room) {
      return false;
    }
    this.state.rooms.delete(roomId);
    const userA = this.state.users.get(room.userA);
    const userB = this.state.users.get(room.userB);
    if (userA) {
      userA.roomId = void 0;
    }
    if (userB) {
      userB.roomId = void 0;
    }
    const durationSec = Math.max(0, (Date.now() - room.startedAt) / 1e3);
    this.state.recordSessionDurationSec(durationSec);
    if (reason === "skip" && actorUserId) {
      const partnerId = this.resolvePartnerId(room, actorUserId);
      const partner = this.state.users.get(partnerId);
      if (partner) {
        emit(partner.socket, "room:ended", { reason });
      }
      return true;
    }
    if (userA) {
      emit(userA.socket, "room:ended", { reason });
    }
    if (userB) {
      emit(userB.socket, "room:ended", { reason });
    }
    return true;
  }
  sweepExpired() {
    const now = Date.now();
    let ended = 0;
    for (const room of Array.from(this.state.rooms.values())) {
      const idleMs = now - room.lastActivityAt;
      const durationMs = now - room.startedAt;
      if (idleMs > this.config.idleTimeoutMs) {
        if (this.endById(room.roomId, "timeout")) {
          ended += 1;
        }
        continue;
      }
      if (durationMs > this.config.maxSessionMs) {
        if (this.endById(room.roomId, "max_duration")) {
          ended += 1;
        }
      }
    }
    return ended;
  }
  resolveRelayContext(fromUserId) {
    const fromUser = this.state.users.get(fromUserId);
    const room = this.findByUser(fromUserId);
    if (!fromUser || !room) {
      if (fromUser) {
        emitSystemError(fromUser.socket, "NOT_IN_ROOM", "You are not in an active room.");
      }
      return null;
    }
    const partnerId = this.resolvePartnerId(room, fromUserId);
    const partner = this.state.users.get(partnerId);
    if (!partner) {
      return null;
    }
    return { room, fromUser, partner };
  }
  resolvePartnerId(room, userId) {
    return room.userA === userId ? room.userB : room.userA;
  }
};

// src/types.ts
var ALLOWED_IMAGE_MIME = /* @__PURE__ */ new Set(["image/jpeg", "image/png", "image/webp"]);

// src/chat-durable-object.ts
var ChatDurableObject = class {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.config = createChatConfig(env);
    this.roomService = new RoomService(this.chatState, this.config);
    this.queueService = new QueueService(this.chatState, this.roomService);
    this.adminService = new AdminService(this.chatState, this.config);
    setInterval(() => {
      this.roomService.sweepExpired();
      this.adminService.broadcastMetrics();
    }, 2e3);
  }
  static {
    __name(this, "ChatDurableObject");
  }
  chatState = new ChatState();
  config;
  rateLimiter = new InMemoryRateLimiter();
  adminService;
  roomService;
  queueService;
  async fetch(request) {
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
    });
  }
  acceptAdmin(socket) {
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
  acceptUser(socket, ip) {
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
  onUserMessage(userId, raw) {
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
  handleQueueJoin(user, rawPayload) {
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
  handleRoomSkip(user) {
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
  handleRoomStay(user) {
    if (user.roomId) {
      return;
    }
    const matched = this.enqueueAndMatch(user);
    if (matched) {
      this.adminService.broadcastMetrics();
    }
  }
  handleChatText(user, rawPayload) {
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
  handleChatImage(user, rawPayload) {
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
  enqueueAndMatch(user) {
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
  disconnectUser(userId) {
    const user = this.chatState.users.get(userId);
    if (!user) {
      return;
    }
    this.roomService.endByUser(userId, "disconnect");
    this.queueService.remove(userId);
    this.chatState.users.delete(userId);
    this.adminService.broadcastMetrics();
  }
};

// src/index.ts
var src_default = {
  async fetch(request, env) {
    return handleEdgeRequest(request, env);
  }
};

// ../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-kCViii/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-kCViii/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  ChatDurableObject,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
