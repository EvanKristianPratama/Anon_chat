"use client";

import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ThemeAccent } from "@/lib/user-preferences";
import { THEME_ACCENT_OPTIONS } from "@/lib/user-preferences";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ThemeAccentSettingsCardProps {
  selectedAccent: ThemeAccent;
  onSelectAccent: (accent: ThemeAccent) => void;
}

const accentSwatchClass: Record<ThemeAccent, string> = {
  mono: "from-zinc-900 to-zinc-500",
  seduction: "from-[#ffefef] via-[#6b6e7a] to-[#293041]",
  "neon-noir": "from-[#12081f] via-[#ae34ff] to-[#ff2ca5]",
  aurora: "from-[#00c2ff] via-[#6d4bff] to-[#26ffd4]"
};

export function ThemeAccentSettingsCard({
  selectedAccent,
  onSelectAccent
}: ThemeAccentSettingsCardProps) {
  return (
    <Card className="rounded-2xl border border-white/55 bg-white/45 shadow-[0_20px_50px_hsl(var(--foreground)/0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Palette className="h-4 w-4" />
          Theme Color
        </CardTitle>
        <CardDescription>Pick your accent color. Changes apply instantly.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {THEME_ACCENT_OPTIONS.map((option) => {
            const isActive = option.value === selectedAccent;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelectAccent(option.value)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3 py-2 text-left backdrop-blur-xl transition-colors",
                  isActive
                    ? "border-primary bg-primary/12 shadow-[0_0_0_1px_hsl(var(--primary)/0.2)]"
                    : "border-white/45 bg-white/55 hover:border-primary/45 dark:border-white/10 dark:bg-white/5"
                )}
              >
                <div>
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-[11px] text-muted-foreground">{option.description}</p>
                </div>
                <span
                  aria-hidden
                  className={cn(
                    "h-5 w-10 rounded-full bg-gradient-to-r shadow-inner",
                    accentSwatchClass[option.value]
                  )}
                />
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
