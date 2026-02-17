import { resolveCorsOrigin } from "./config";
import type { Env } from "./types";

const USER_SOCKET_PATH = "/ws";
const ADMIN_SOCKET_PATH = "/admin/ws";

const withCorsHeaders = (corsOrigin: string): HeadersInit => ({
  "Access-Control-Allow-Origin": corsOrigin
});

const createPreflightResponse = (corsOrigin: string): Response =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": corsOrigin,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type,Authorization"
    }
  });

const createHealthResponse = (corsOrigin: string): Response =>
  Response.json(
    {
      ok: true,
      at: Date.now()
    },
    {
      headers: withCorsHeaders(corsOrigin)
    }
  );

const isChatSocketPath = (pathname: string): boolean => {
  return pathname === USER_SOCKET_PATH || pathname === ADMIN_SOCKET_PATH;
};

export const handleEdgeRequest = async (request: Request, env: Env): Promise<Response> => {
  const url = new URL(request.url);
  const corsOrigin = resolveCorsOrigin(env);

  if (request.method === "OPTIONS") {
    return createPreflightResponse(corsOrigin);
  }

  if (url.pathname === "/" || url.pathname === "/health") {
    return createHealthResponse(corsOrigin);
  }

  if (!isChatSocketPath(url.pathname)) {
    return new Response("Not Found", { status: 404 });
  }

  if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
    return new Response("Expected websocket upgrade", { status: 426 });
  }

  const role = url.pathname === ADMIN_SOCKET_PATH ? "admin" : "user";
  const doId = env.CHAT_DO.idFromName("global-chat");
  const stub = env.CHAT_DO.get(doId);

  const proxiedHeaders = new Headers(request.headers);
  proxiedHeaders.set("x-role", role);
  proxiedHeaders.set("x-client-ip", request.headers.get("CF-Connecting-IP") ?? "0.0.0.0");

  const proxiedRequest = new Request("https://do.internal/connect", {
    method: "GET",
    headers: proxiedHeaders
  });

  return stub.fetch(proxiedRequest);
};
