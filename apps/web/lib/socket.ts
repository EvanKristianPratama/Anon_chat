import type { ClientToServerEvents, ServerToClientEvents } from "@anon/contracts";
import { io, Socket } from "socket.io-client";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const createSocket = (serverUrl: string, namespace = ""): AppSocket => {
  return io(`${serverUrl}${namespace}`, {
    autoConnect: false,
    transports: ["websocket"]
  });
};
