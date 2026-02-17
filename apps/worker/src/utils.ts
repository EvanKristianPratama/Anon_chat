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
