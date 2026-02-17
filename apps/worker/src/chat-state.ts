import type { AdminMetrics, AdminSession, RoomRecord, UserSession } from "./types";

export class ChatState {
  readonly users = new Map<string, UserSession>();
  readonly admins = new Map<string, AdminSession>();
  readonly rooms = new Map<string, RoomRecord>();
  readonly waitingQueue: string[] = [];
  readonly waitingMembers = new Set<string>();

  private sessionDurationSumSec = 0;
  private sessionCount = 0;
  private peakOnlineUsers = 0;

  markUserConnected(): void {
    if (this.users.size > this.peakOnlineUsers) {
      this.peakOnlineUsers = this.users.size;
    }
  }

  recordSessionDurationSec(durationSec: number): void {
    this.sessionDurationSumSec += Math.max(0, durationSec);
    this.sessionCount += 1;
  }

  snapshotAdminMetrics(): AdminMetrics {
    return {
      onlineUsers: this.users.size,
      activeRooms: this.rooms.size,
      avgSessionDurationSec: this.sessionCount > 0 ? this.sessionDurationSumSec / this.sessionCount : 0,
      peakOnlineUsers: this.peakOnlineUsers,
      at: Date.now()
    };
  }
}
