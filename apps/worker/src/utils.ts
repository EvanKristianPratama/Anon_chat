import {
  ALLOWED_DICEBEAR_STYLE,
  ALLOWED_IMAGE_MIME,
  type DicebearStyle,
  type ImageMime,
  type QueueJoinAvatarPayload,
  type UserAvatar
} from "./types";

export const sanitizeText = (value: string): string =>
  value
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");

export const normalizeAlias = (value: string): string | null => {
  const normalized = sanitizeText(value.trim().replace(/\s+/g, " ").slice(0, 24));
  return normalized.length >= 2 ? normalized : null;
};

export const base64ByteLength = (raw: string): number => {
  const base64 = raw.includes(",") ? raw.split(",").pop() ?? "" : raw;
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
};

export const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const normalizeAvatarSeed = (value: string): string => {
  const cleaned = sanitizeText(value)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z0-9 _-]/g, "")
    .slice(0, 32);

  return cleaned.length > 0 ? cleaned : "anonymous";
};

const isLikelyBase64 = (value: string): boolean => /^[A-Za-z0-9+/=]+$/.test(value);

export const normalizeAvatarPayload = (
  payload: QueueJoinAvatarPayload,
  maxAvatarBytes: number,
  fallbackSeed: string
): UserAvatar | null => {
  if (payload.type === "dicebear") {
    const style = ALLOWED_DICEBEAR_STYLE.has(payload.style as DicebearStyle)
      ? (payload.style as DicebearStyle)
      : "avataaars";

    const seed = normalizeAvatarSeed(
      typeof payload.seed === "string" ? payload.seed : fallbackSeed
    );

    return {
      type: "dicebear",
      style,
      seed
    };
  }

  const mime = payload.mime;
  const data = payload.data;

  if (!mime || !ALLOWED_IMAGE_MIME.has(mime as ImageMime)) {
    return null;
  }

  if (!data || !isLikelyBase64(data)) {
    return null;
  }

  if (base64ByteLength(data) > maxAvatarBytes) {
    return null;
  }

  return {
    type: "custom",
    mime: mime as ImageMime,
    data
  };
};

export const buildDicebearAvatarUrl = (style: DicebearStyle, seed: string): string => {
  const params = new URLSearchParams({
    seed: normalizeAvatarSeed(seed),
    backgroundType: "gradientLinear",
    radius: "50"
  });

  return `https://api.dicebear.com/9.x/${style}/svg?${params.toString()}`;
};

export const serializeAvatar = (avatar: UserAvatar | undefined): string | undefined => {
  if (!avatar) {
    return undefined;
  }

  if (avatar.type === "custom") {
    return `data:${avatar.mime};base64,${avatar.data}`;
  }

  return buildDicebearAvatarUrl(avatar.style, avatar.seed);
};
