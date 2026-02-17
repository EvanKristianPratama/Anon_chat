"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { buttonVariants } from "@/components/ui/button";
import { DisplayNameSettingsCard } from "@/components/features/settings/display-name-settings-card";
import { ThemeAccentSettingsCard } from "@/components/features/settings/theme-accent-settings-card";
import { AvatarSettingsCard } from "@/components/features/settings/avatar-settings-card";
import { cn } from "@/lib/utils";
import {
  applyThemeAccent,
  persistDisplayName,
  persistThemeAccent,
  readStoredDisplayName,
  readStoredThemeAccent,
  type ThemeAccent
} from "@/lib/user-preferences";
import {
  createDefaultAvatarPreference,
  persistAvatarPreference,
  readStoredAvatarPreference,
  resolveAvatarUrl,
  type AvatarPreference
} from "@/lib/avatar";

export function SettingsDashboard() {
  const [displayName, setDisplayName] = useState("");
  const [accent, setAccent] = useState<ThemeAccent>("mono");
  const [avatar, setAvatar] = useState<AvatarPreference>(createDefaultAvatarPreference());

  useEffect(() => {
    const storedName = readStoredDisplayName();
    if (storedName.length > 0) {
      setDisplayName(storedName);
    }

    const storedAccent = readStoredThemeAccent();
    setAccent(storedAccent);
    applyThemeAccent(storedAccent);

    const storedAvatar = readStoredAvatarPreference(storedName);
    setAvatar(storedAvatar);
  }, []);

  const handleSaveDisplayName = (nextDisplayName: string) => {
    const normalized = persistDisplayName(nextDisplayName);
    setDisplayName(normalized);
  };

  const handleSelectAccent = (nextAccent: ThemeAccent) => {
    const savedAccent = persistThemeAccent(nextAccent);
    setAccent(savedAccent);
  };

  const handleAvatarChange = (nextAvatar: AvatarPreference) => {
    const savedAvatar = persistAvatarPreference(nextAvatar);
    setAvatar(savedAvatar);
  };

  return (
    <DashboardShell displayName={displayName} selfAvatarUrl={resolveAvatarUrl(avatar)}>
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto w-full max-w-5xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/55 bg-white/45 px-4 py-3 shadow-[0_18px_45px_hsl(var(--foreground)/0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Workspace Settings
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight">Anotalk Preferences</h1>
              <p className="text-xs text-muted-foreground">
                Personalize alias, avatar, and full UI palette (buttons, cards, and background).
              </p>
            </div>
            <Link href="/" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              <ArrowLeft className="h-4 w-4" />
              Back to chat
            </Link>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <DisplayNameSettingsCard displayName={displayName} onSave={handleSaveDisplayName} />
            <ThemeAccentSettingsCard selectedAccent={accent} onSelectAccent={handleSelectAccent} />
            <AvatarSettingsCard
              displayName={displayName}
              avatar={avatar}
              onChange={handleAvatarChange}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
