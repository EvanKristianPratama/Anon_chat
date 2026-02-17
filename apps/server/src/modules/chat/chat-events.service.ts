import { Injectable } from "@nestjs/common";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData
} from "@anon/contracts";
import { Server } from "socket.io";

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

@Injectable()
export class ChatEventsService {
  private server?: TypedServer;

  setServer(server: TypedServer): void {
    this.server = server;
  }

  emitToSocket<EventName extends keyof ServerToClientEvents>(
    socketId: string,
    event: EventName,
    payload: Parameters<ServerToClientEvents[EventName]>[0]
  ): void {
    if (!this.server) {
      return;
    }

    const emitter = this.server.to(socketId) as unknown as {
      emit: (
        eventName: EventName,
        payloadValue: Parameters<ServerToClientEvents[EventName]>[0]
      ) => void;
    };

    emitter.emit(event, payload);
  }

  isSocketConnected(socketId: string): boolean {
    if (!this.server) {
      return false;
    }

    return this.server.sockets.sockets.has(socketId);
  }
}
