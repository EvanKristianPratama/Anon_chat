export type UserId = string;
export type RoomId = string;

export type RoomStatus = "active" | "ending";

export interface RoomState {
  roomId: RoomId;
  userA: UserId;
  userB: UserId;
  startedAt: number;
  lastActivityAt: number;
  status: RoomStatus;
}

export interface ClientToServerEvents {
  "queue:join": (payload: { alias?: string }) => void;
  "room:skip": () => void;
  "room:stay": () => void;
  "chat:text": (payload: { text: string }) => void;
  "chat:image": (payload: {
    mime: "image/jpeg" | "image/png" | "image/webp";
    bytes: ArrayBuffer | Uint8Array;
  }) => void;
  "session:heartbeat": () => void;
  "admin:subscribe": (payload: { token: string }) => void;
}

export interface ServerToClientEvents {
  "queue:waiting": () => void;
  "room:matched": (payload: { roomId: RoomId; partnerId: UserId; partnerAlias?: string }) => void;
  "room:ended": (payload: { reason: EndReason }) => void;
  "chat:text": (payload: { from: UserId; alias?: string; text: string; at: number }) => void;
  "chat:image": (payload: {
    from: UserId;
    alias?: string;
    mime: "image/jpeg" | "image/png" | "image/webp";
    bytes: ArrayBuffer | Uint8Array;
    at: number;
  }) => void;
  "system:error": (payload: { code: ErrorCode; message: string }) => void;
  "admin:metrics": (payload: AdminMetrics) => void;
}

export interface InterServerEvents {
  "admin:metrics": (payload: AdminMetrics) => void;
}

export interface SocketData {
  userId: UserId;
  ip: string;
  alias?: string;
}

export interface AdminMetrics {
  onlineUsers: number;
  activeRooms: number;
  avgSessionDurationSec: number;
  peakOnlineUsers: number;
  at: number;
}

export type EndReason = "skip" | "disconnect" | "timeout" | "max_duration";

export type ErrorCode =
  | "RATE_LIMITED"
  | "BAD_REQUEST"
  | "MESSAGE_TOO_LONG"
  | "IMAGE_TOO_LARGE"
  | "UNSUPPORTED_IMAGE"
  | "NOT_IN_ROOM";
