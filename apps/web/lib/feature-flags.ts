const parseBoolean = (value: string | undefined): boolean | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }
  if (normalized === "false" || normalized === "0") {
    return false;
  }
  return null;
};

export const isAdminUiEnabled = (): boolean => {
  const explicit = parseBoolean(process.env.NEXT_PUBLIC_ENABLE_ADMIN);
  if (explicit !== null) {
    return explicit;
  }

  // Default: hide admin UI on Vercel deployments, show in local dev.
  return process.env.VERCEL !== "1";
};
