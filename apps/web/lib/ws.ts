export interface WsEnvelope<TPayload = unknown> {
  event: string;
  payload?: TPayload;
}

export const toWebSocketUrl = (baseUrl: string, path: string): string => {
  const withProtocol =
    baseUrl.startsWith("ws://") || baseUrl.startsWith("wss://")
      ? baseUrl
      : baseUrl.replace(/^http/, "ws");

  const url = new URL(withProtocol);
  url.pathname = path;
  url.search = "";
  url.hash = "";
  return url.toString();
};

export const sendWsEvent = (socket: WebSocket, event: string, payload?: unknown): void => {
  socket.send(JSON.stringify({ event, payload } satisfies WsEnvelope));
};

export const parseWsEnvelope = (raw: unknown): WsEnvelope | null => {
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
