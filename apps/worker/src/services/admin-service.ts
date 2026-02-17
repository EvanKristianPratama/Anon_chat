import type { ChatConfig } from "../config";
import { emit, emitSystemError, parseEnvelope, safeClose } from "../protocol";
import { parseAdminSubscribePayload } from "../payload-parsers";
import type { ChatState } from "../chat-state";

export class AdminService {
  constructor(
    private readonly state: ChatState,
    private readonly config: ChatConfig
  ) {}

  connect(socket: WebSocket): string {
    const adminId = crypto.randomUUID();
    this.state.admins.set(adminId, {
      adminId,
      socket,
      authorized: false
    });

    return adminId;
  }

  disconnect(adminId: string): void {
    this.state.admins.delete(adminId);
  }

  handleMessage(adminId: string, raw: unknown): void {
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

  broadcastMetrics(): void {
    const payload = this.state.snapshotAdminMetrics();
    for (const admin of this.state.admins.values()) {
      if (!admin.authorized) {
        continue;
      }

      emit(admin.socket, "admin:metrics", payload);
    }
  }
}
