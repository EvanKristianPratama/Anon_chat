import type { ErrorCode, WsEnvelope } from "./types";

export const parseEnvelope = (raw: unknown): WsEnvelope | null => {
  if (typeof raw !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as WsEnvelope;
    if (!parsed || typeof parsed.event !== "string") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

export const safeClose = (socket: WebSocket): void => {
  try {
    socket.close();
  } catch {
    // no-op
  }
};

export const emit = (socket: WebSocket, event: string, payload?: unknown): void => {
  try {
    socket.send(JSON.stringify({ event, payload } satisfies WsEnvelope));
  } catch {
    safeClose(socket);
  }
};

export const emitSystemError = (socket: WebSocket, code: ErrorCode, message: string): void => {
  emit(socket, "system:error", { code, message });
};
