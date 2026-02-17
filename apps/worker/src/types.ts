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
  MAX_AVATAR_BYTES?: string;
  IDLE_TIMEOUT_SEC?: string;
  MAX_SESSION_SEC?: string;
}

export interface WsEnvelope<TPayload = unknown> {
  event: string;
  payload?: TPayload;
}

export type ImageMime = "image/jpeg" | "image/png" | "image/webp";

export const ALLOWED_IMAGE_MIME = new Set<ImageMime>(["image/jpeg", "image/png", "image/webp"]);

export type DicebearStyle = "avataaars" | "open-peeps";

export const ALLOWED_DICEBEAR_STYLE = new Set<DicebearStyle>(["avataaars", "open-peeps"]);

export type EndReason = "skip" | "disconnect" | "timeout" | "max_duration";

export type ErrorCode =
  | "RATE_LIMITED"
  | "BAD_REQUEST"
  | "MESSAGE_TOO_LONG"
  | "IMAGE_TOO_LARGE"
  | "UNSUPPORTED_IMAGE"
  | "NOT_IN_ROOM"
  | "INVALID_AVATAR";

export type UserAvatar =
  | {
      type: "dicebear";
      style: DicebearStyle;
      seed: string;
    }
  | {
      type: "custom";
      mime: ImageMime;
      data: string;
    };

export interface UserSession {
  userId: string;
  socket: WebSocket;
  ip: string;
  alias?: string;
  avatar?: UserAvatar;
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

export type QueueJoinAvatarPayload =
  | {
      type: "dicebear";
      style?: string;
      seed?: string;
    }
  | {
      type: "custom";
      mime?: string;
      data?: string;
    };

export interface QueueJoinPayload {
  alias?: string;
  avatar?: QueueJoinAvatarPayload;
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
