import { Catch, ArgumentsHost, Logger } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";
import type { Socket } from "socket.io";

/**
 * Global WebSocket exception filter.
 * Catches unhandled errors, logs them, and emits a safe `system:error` event.
 */
@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
    private readonly logger = new Logger(WsExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const client = host.switchToWs().getClient<Socket>();

        if (exception instanceof WsException) {
            const error = exception.getError();
            const message = typeof error === "string" ? error : "WebSocket error";
            client.emit("system:error", { code: "BAD_REQUEST", message });
            return;
        }

        this.logger.error("Unhandled WS exception", exception);
        client.emit("system:error", {
            code: "BAD_REQUEST",
            message: "Internal server error.",
        });
    }
}
