import type { ConnectionOptions } from "bullmq";
import { env } from "./env";

const redisUrl = new URL(env.redisUrl);

const dbFromPath = (): number => {
  const raw = redisUrl.pathname.replace("/", "");
  const parsed = Number(raw || "0");
  return Number.isFinite(parsed) ? parsed : 0;
};

export const bullConnection: ConnectionOptions = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || "6379"),
  username: redisUrl.username || undefined,
  password: redisUrl.password || undefined,
  db: dbFromPath(),
  maxRetriesPerRequest: null
};
