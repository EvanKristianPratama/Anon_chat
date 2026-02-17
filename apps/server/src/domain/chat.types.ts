import type { EndReason } from "@anon/contracts";

export interface QueueEntry {
  userId: string;
  socketId: string;
  enqueuedAt: number;
}

export interface RoomRecord {
  roomId: string;
  userA: string;
  userB: string;
  socketA: string;
  socketB: string;
  startedAt: number;
  lastActivityAt: number;
  status: "active" | "ending";
}

export interface EndRoomResult {
  room: RoomRecord;
  reason: EndReason;
}
