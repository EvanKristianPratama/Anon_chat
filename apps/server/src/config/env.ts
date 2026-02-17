const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: toNumber(process.env.PORT, 4000),
  redisUrl: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  adminToken: process.env.ADMIN_TOKEN ?? "dev-admin-token",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  maxMessageLength: toNumber(process.env.MAX_MESSAGE_LENGTH, 500),
  maxImageBytes: toNumber(process.env.MAX_IMAGE_BYTES, 1_000_000),
  idleTimeoutSec: toNumber(process.env.IDLE_TIMEOUT_SEC, 60),
  maxSessionSec: toNumber(process.env.MAX_SESSION_SEC, 900),
  aliasTtlSec: toNumber(process.env.ALIAS_TTL_SEC, 86_400),
  aliasMaxLength: toNumber(process.env.ALIAS_MAX_LENGTH, 24),
  aliasMinLength: toNumber(process.env.ALIAS_MIN_LENGTH, 2),
} as const;
