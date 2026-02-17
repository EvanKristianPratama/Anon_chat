export type AvatarMime = "image/jpeg" | "image/png" | "image/webp";
export type DicebearStyle = "avataaars" | "open-peeps";

export type AvatarPreference =
  | {
      type: "dicebear";
      style: DicebearStyle;
      seed: string;
    }
  | {
      type: "custom";
      mime: AvatarMime;
      data: string;
    };

export interface DicebearStyleOption {
  value: DicebearStyle;
  label: string;
  description: string;
}

export const DICEBEAR_STYLE_OPTIONS: DicebearStyleOption[] = [
  {
    value: "avataaars",
    label: "Avataaars",
    description: "Rounded cartoon style (iPhone-like)"
  },
  {
    value: "open-peeps",
    label: "Open Peeps",
    description: "Playful hand-drawn character style"
  }
];

export const AVATAR_STORAGE_KEY = "anotalk_avatar_pref";
export const MAX_AVATAR_UPLOAD_BYTES = 256_000;

const ALLOWED_UPLOAD_MIME = new Set<AvatarMime>(["image/jpeg", "image/png", "image/webp"]);

const isClient = (): boolean => typeof window !== "undefined";

const sanitizeSeed = (value: string): string => {
  const cleaned = value
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[^a-zA-Z0-9 _-]/g, "")
    .slice(0, 32);

  return cleaned.length > 0 ? cleaned : "anonymous";
};

export const createDefaultAvatarPreference = (displayName = ""): AvatarPreference => ({
  type: "dicebear",
  style: "avataaars",
  seed: sanitizeSeed(displayName || "anonymous")
});

const toDataUrl = (mime: AvatarMime, data: string): string => `data:${mime};base64,${data}`;

export const resolveAvatarUrl = (avatar: AvatarPreference): string => {
  if (avatar.type === "custom") {
    return toDataUrl(avatar.mime, avatar.data);
  }

  return buildDicebearAvatarUrl(avatar.style, avatar.seed);
};

export const buildDicebearAvatarUrl = (style: DicebearStyle, seed: string): string => {
  const normalizedSeed = sanitizeSeed(seed);
  const params = new URLSearchParams({
    seed: normalizedSeed,
    backgroundType: "gradientLinear",
    radius: "50"
  });

  return `https://api.dicebear.com/9.x/${style}/svg?${params.toString()}`;
};

const parseStoredAvatar = (raw: string | null): AvatarPreference | null => {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AvatarPreference>;
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (parsed.type === "dicebear") {
      const style = parsed.style === "open-peeps" ? "open-peeps" : "avataaars";
      const seed = sanitizeSeed(typeof parsed.seed === "string" ? parsed.seed : "anonymous");
      return { type: "dicebear", style, seed };
    }

    if (
      parsed.type === "custom" &&
      typeof parsed.mime === "string" &&
      typeof parsed.data === "string" &&
      ALLOWED_UPLOAD_MIME.has(parsed.mime as AvatarMime)
    ) {
      const mime = parsed.mime as AvatarMime;
      const data = parsed.data;
      return { type: "custom", mime, data };
    }

    return null;
  } catch {
    return null;
  }
};

export const readStoredAvatarPreference = (displayName = ""): AvatarPreference => {
  if (!isClient()) {
    return createDefaultAvatarPreference(displayName);
  }

  const parsed = parseStoredAvatar(window.localStorage.getItem(AVATAR_STORAGE_KEY));
  if (!parsed) {
    return createDefaultAvatarPreference(displayName);
  }

  if (parsed.type === "dicebear") {
    return {
      ...parsed,
      seed: parsed.seed || sanitizeSeed(displayName || "anonymous")
    };
  }

  return parsed;
};

export const persistAvatarPreference = (avatar: AvatarPreference): AvatarPreference => {
  const normalized =
    avatar.type === "dicebear"
      ? {
          type: "dicebear" as const,
          style: avatar.style,
          seed: sanitizeSeed(avatar.seed)
        }
      : avatar;

  if (isClient()) {
    window.localStorage.setItem(AVATAR_STORAGE_KEY, JSON.stringify(normalized));
  }

  return normalized;
};

export const buildQueueAvatarPayload = (avatar: AvatarPreference, displayName: string): AvatarPreference => {
  if (avatar.type === "custom") {
    return avatar;
  }

  const seedFromAvatar = sanitizeSeed(avatar.seed);
  const useDisplayNameSeed = seedFromAvatar.toLowerCase() === "anonymous";

  return {
    type: "dicebear",
    style: avatar.style,
    seed: useDisplayNameSeed
      ? sanitizeSeed(displayName || seedFromAvatar)
      : seedFromAvatar
  };
};

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Invalid file encoding"));
        return;
      }

      const [, base64] = reader.result.split(",", 2);
      if (!base64) {
        reject(new Error("Invalid data URL"));
        return;
      }

      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

export const avatarUploadSizeLabel = (): string => `${Math.round(MAX_AVATAR_UPLOAD_BYTES / 1024)} KB`;

export const createUploadedAvatarPreference = async (file: File): Promise<AvatarPreference> => {
  if (!ALLOWED_UPLOAD_MIME.has(file.type as AvatarMime)) {
    throw new Error("Allowed avatar types: jpeg, png, webp");
  }

  if (file.size > MAX_AVATAR_UPLOAD_BYTES) {
    throw new Error(`Avatar max size is ${avatarUploadSizeLabel()}`);
  }

  const data = await fileToBase64(file);
  return {
    type: "custom",
    mime: file.type as AvatarMime,
    data
  };
};

export const updateDicebearSeed = (avatar: AvatarPreference, seed: string): AvatarPreference => {
  if (avatar.type !== "dicebear") {
    return createDefaultAvatarPreference(seed);
  }

  return {
    type: "dicebear",
    style: avatar.style,
    seed: sanitizeSeed(seed)
  };
};

export const updateDicebearStyle = (avatar: AvatarPreference, style: DicebearStyle): AvatarPreference => {
  if (avatar.type !== "dicebear") {
    return {
      type: "dicebear",
      style,
      seed: "anonymous"
    };
  }

  return {
    ...avatar,
    style
  };
};

export const sanitizeAvatarUrl = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  }

  if (value.startsWith("data:image/jpeg;base64,") || value.startsWith("data:image/png;base64,") || value.startsWith("data:image/webp;base64,")) {
    return value;
  }

  if (value.startsWith("https://api.dicebear.com/")) {
    return value;
  }

  return null;
};
