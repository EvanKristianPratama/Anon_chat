import type { ChatState } from "../chat-state";
import type { ChatConfig } from "../config";
import { emit, emitSystemError } from "../protocol";
import type { EndReason, ImageMime, RoomRecord, UserSession } from "../types";

interface RelayContext {
  room: RoomRecord;
  fromUser: UserSession;
  partner: UserSession;
}

export class RoomService {
  constructor(
    private readonly state: ChatState,
    private readonly config: ChatConfig
  ) {}

  createRoom(firstUserId: string, secondUserId: string): RoomRecord | null {
    const first = this.state.users.get(firstUserId);
    const second = this.state.users.get(secondUserId);
    if (!first || !second || first.roomId || second.roomId) {
      return null;
    }

    const roomId = crypto.randomUUID();
    const now = Date.now();
    const room: RoomRecord = {
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

  findByUser(userId: string): RoomRecord | null {
    const roomId = this.state.users.get(userId)?.roomId;
    if (!roomId) {
      return null;
    }

    return this.state.rooms.get(roomId) ?? null;
  }

  touchByUser(userId: string): void {
    const room = this.findByUser(userId);
    if (room) {
      room.lastActivityAt = Date.now();
    }
  }

  relayText(fromUserId: string, text: string): void {
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

  relayImage(fromUserId: string, mime: ImageMime, data: string): void {
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

  endByUser(userId: string, reason: EndReason): boolean {
    const room = this.findByUser(userId);
    if (!room) {
      return false;
    }

    return this.endById(room.roomId, reason, userId);
  }

  endById(roomId: string, reason: EndReason, actorUserId?: string): boolean {
    const room = this.state.rooms.get(roomId);
    if (!room) {
      return false;
    }

    this.state.rooms.delete(roomId);

    const userA = this.state.users.get(room.userA);
    const userB = this.state.users.get(room.userB);
    if (userA) {
      userA.roomId = undefined;
    }
    if (userB) {
      userB.roomId = undefined;
    }

    const durationSec = Math.max(0, (Date.now() - room.startedAt) / 1000);
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

  sweepExpired(): number {
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

  private resolveRelayContext(fromUserId: string): RelayContext | null {
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

  private resolvePartnerId(room: RoomRecord, userId: string): string {
    return room.userA === userId ? room.userB : room.userA;
  }
}
