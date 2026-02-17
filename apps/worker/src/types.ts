export interface DurableObjectNamespaceLike {
  idFromName(name: string): unknown;
  get(id: unknown): { fetch(request: Request): Promise<Response> };
}

export interface Env {
  CHAT_DO: DurableObjectNamespaceLike;
  ADMIN_TOKEN?: string;
  CORS_ORIGIN?: string;
  MAX_MESSAGE_LENGTH?: string;
  MAX_IMAGE_BYTES?: string;
  IDLE_TIMEOUT_SEC?: string;
  MAX_SESSION_SEC?: string;
}

export interface WsEnvelope<TPayload = unknown> {
  event: string;
  payload?: TPayload;
}

export type ImageMime = "image/jpeg" | "image/png" | "image/webp";

export const ALLOWED_IMAGE_MIME = new Set<ImageMime>(["image/jpeg", "image/png", "image/webp"]);

export type EndReason = "skip" | "disconnect" | "timeout" | "max_duration";

export type ErrorCode =
  | "RATE_LIMITED"
  | "BAD_REQUEST"
  | "MESSAGE_TOO_LONG"
  | "IMAGE_TOO_LARGE"
  | "UNSUPPORTED_IMAGE"
  | "NOT_IN_ROOM";

export interface UserSession {
  userId: string;
  socket: WebSocket;
  ip: string;
  alias?: string;
  roomId?: string;
}

export interface AdminSession {
  adminId: string;
  socket: WebSocket;
  authorized: boolean;
}

export interface RoomRecord {
  roomId: string;
  userA: string;
  userB: string;
  startedAt: number;
  lastActivityAt: number;
}

export interface AdminMetrics {
  onlineUsers: number;
  activeRooms: number;
  avgSessionDurationSec: number;
  peakOnlineUsers: number;
  at: number;
}

export interface QueueJoinPayload {
  alias?: string;
}

export interface ChatTextPayload {
  text?: string;
}

export interface ChatImagePayload {
  mime?: ImageMime;
  data?: string;
}

export interface AdminSubscribePayload {
  token?: string;
}
