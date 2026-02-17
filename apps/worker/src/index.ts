import { handleEdgeRequest } from "./http-gateway";
import { ChatDurableObject } from "./chat-durable-object";
import type { Env } from "./types";

export { ChatDurableObject };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleEdgeRequest(request, env);
  }
};
