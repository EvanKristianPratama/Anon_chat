import type { Env } from "./types";

export interface ChatConfig {
  adminToken: string;
  maxMessageLength: number;
  maxImageBytes: number;
  idleTimeoutMs: number;
  maxSessionMs: number;
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const createChatConfig = (env: Env): ChatConfig => {
  return {
    adminToken: env.ADMIN_TOKEN ?? "dev-admin-token",
    maxMessageLength: parseNumber(env.MAX_MESSAGE_LENGTH, 500),
    maxImageBytes: parseNumber(env.MAX_IMAGE_BYTES, 1_000_000),
    idleTimeoutMs: parseNumber(env.IDLE_TIMEOUT_SEC, 60) * 1000,
    maxSessionMs: parseNumber(env.MAX_SESSION_SEC, 900) * 1000
  };
};

export const resolveCorsOrigin = (env: Env): string => env.CORS_ORIGIN ?? "*";
