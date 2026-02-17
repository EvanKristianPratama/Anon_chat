import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { OnModuleDestroy, UseFilters } from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";
import { Server, Socket } from "socket.io";
import { env } from "../../config/env";
import { WsExceptionFilter } from "../../common/ws-exception.filter";
import { MetricsService } from "../../services/metrics.service";

/**
 * Compares two strings in constant time to prevent timing attacks.
 */
function safeTokenCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return timingSafeEqual(bufA, bufB);
}

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  namespace: "/admin",
  transports: ["websocket"],
  cors: { origin: env.corsOrigin },
})
export class AdminGateway implements OnGatewayInit, OnGatewayDisconnect, OnModuleDestroy {
  @WebSocketServer()
  server!: Server;

  private readonly subscribers = new Set<string>();
  private tick?: ReturnType<typeof setInterval>;

  constructor(private readonly metrics: MetricsService) { }

  afterInit(): void {
    this.tick = setInterval(() => {
      void this.pushMetrics();
    }, 2000);
  }

  handleDisconnect(socket: Socket): void {
    this.subscribers.delete(socket.id);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.tick) clearInterval(this.tick);
  }

  @SubscribeMessage("admin:subscribe")
  async subscribe(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { token: string },
  ): Promise<void> {
    if (!payload || !safeTokenCompare(payload.token, env.adminToken)) {
      socket.emit("system:error", {
        code: "BAD_REQUEST",
        message: "Invalid admin token.",
      });
      return;
    }

    socket.join("admins");
    this.subscribers.add(socket.id);
    socket.emit("admin:metrics", await this.metrics.snapshot());
  }

  private async pushMetrics(): Promise<void> {
    if (this.subscribers.size === 0) return;
    this.server.to("admins").emit("admin:metrics", await this.metrics.snapshot());
  }
}
