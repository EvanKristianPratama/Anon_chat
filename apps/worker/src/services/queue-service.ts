import type { ChatState } from "../chat-state";
import type { RoomRecord, UserSession } from "../types";
import { RoomService } from "./room-service";

export interface MatchResult {
  room: RoomRecord;
  first: UserSession;
  second: UserSession;
}

export class QueueService {
  constructor(
    private readonly state: ChatState,
    private readonly roomService: RoomService
  ) {}

  enqueue(userId: string): boolean {
    if (this.state.waitingMembers.has(userId)) {
      return false;
    }

    this.state.waitingMembers.add(userId);
    this.state.waitingQueue.push(userId);
    return true;
  }

  remove(userId: string): void {
    this.state.waitingMembers.delete(userId);
    this.removeFromQueue(userId);
  }

  createMatches(): MatchResult[] {
    const matches: MatchResult[] = [];

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

  private dequeueNextEligible(): string | null {
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

  private removeFromQueue(userId: string): void {
    for (let index = this.state.waitingQueue.length - 1; index >= 0; index -= 1) {
      if (this.state.waitingQueue[index] === userId) {
        this.state.waitingQueue.splice(index, 1);
      }
    }
  }
}
