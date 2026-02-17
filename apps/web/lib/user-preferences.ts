export const DISPLAY_NAME_KEY = "anon_display_name";
export const LEGACY_DISPLAY_NAME_KEY = "anon_alias";
export const THEME_ACCENT_KEY = "anotalk_theme_accent";

export const THEME_ACCENTS = ["mono", "seduction", "neon-noir", "aurora"] as const;
export type ThemeAccent = (typeof THEME_ACCENTS)[number];

export interface ThemeAccentOption {
  value: ThemeAccent;
  label: string;
  description: string;
}

export const THEME_ACCENT_OPTIONS: ThemeAccentOption[] = [
  {
    value: "mono",
    label: "Mono",
    description: "Clean monochrome professional style"
  },
  {
    value: "seduction",
    label: "Seduction",
    description: "Soft blush + navy palette (modern elegant)"
  },
  {
    value: "neon-noir",
    label: "Neon Noir",
    description: "Purple-pink-black with neon glow"
  },
  {
    value: "aurora",
    label: "Aurora",
    description: "Electric cyan-violet futuristic vibe"
  }
];

export const normalizeDisplayName = (value: string): string =>
  value.trim().replace(/\s+/g, " ").slice(0, 24);

const isClient = (): boolean => typeof window !== "undefined";

const isThemeAccent = (value: string | null): value is ThemeAccent =>
  Boolean(value && THEME_ACCENTS.includes(value as ThemeAccent));

export const readStoredDisplayName = (): string => {
  if (!isClient()) {
    return "";
  }

  const primary = window.localStorage.getItem(DISPLAY_NAME_KEY);
  if (primary && primary.trim().length > 0) {
    return normalizeDisplayName(primary);
  }

  const legacy = window.localStorage.getItem(LEGACY_DISPLAY_NAME_KEY);
  if (legacy && legacy.trim().length > 0) {
    return normalizeDisplayName(legacy);
  }

  return "";
};

export const persistDisplayName = (displayName: string): string => {
  const normalized = normalizeDisplayName(displayName);

  if (isClient()) {
    window.localStorage.setItem(DISPLAY_NAME_KEY, normalized);
    window.localStorage.setItem(LEGACY_DISPLAY_NAME_KEY, normalized);
  }

  return normalized;
};

export const readStoredThemeAccent = (): ThemeAccent => {
  if (!isClient()) {
    return "mono";
  }

  const stored = window.localStorage.getItem(THEME_ACCENT_KEY);
  return isThemeAccent(stored) ? stored : "mono";
};

export const applyThemeAccent = (accent: ThemeAccent): void => {
  if (!isClient()) {
    return;
  }

  document.documentElement.dataset.accent = accent;
};

export const persistThemeAccent = (accent: ThemeAccent): ThemeAccent => {
  if (isClient()) {
    window.localStorage.setItem(THEME_ACCENT_KEY, accent);
  }
  applyThemeAccent(accent);
  return accent;
};
