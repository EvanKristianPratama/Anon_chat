"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { applyThemeAccent, readStoredThemeAccent } from "@/lib/user-preferences";

interface AccentProviderProps {
  children: ReactNode;
}

export function AccentProvider({ children }: AccentProviderProps) {
  useEffect(() => {
    applyThemeAccent(readStoredThemeAccent());
  }, []);

  return <>{children}</>;
}
