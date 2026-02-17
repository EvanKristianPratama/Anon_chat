"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { Sparkles, Upload, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  createDefaultAvatarPreference,
  createUploadedAvatarPreference,
  DICEBEAR_STYLE_OPTIONS,
  resolveAvatarUrl,
  updateDicebearSeed,
  updateDicebearStyle,
  avatarUploadSizeLabel,
  type AvatarPreference,
  type DicebearStyle
} from "@/lib/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AvatarSettingsCardProps {
  displayName: string;
  avatar: AvatarPreference;
  onChange: (nextAvatar: AvatarPreference) => void;
}

export function AvatarSettingsCard({ displayName, avatar, onChange }: AvatarSettingsCardProps) {
  const [seedInput, setSeedInput] = useState(
    avatar.type === "dicebear" ? avatar.seed : displayName || "anonymous"
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (avatar.type === "dicebear") {
      setSeedInput(avatar.seed);
    }
  }, [avatar]);

  const handleSwitchToDicebear = () => {
    setError(null);
    onChange(createDefaultAvatarPreference(displayName));
  };

  const handleDicebearStyle = (style: DicebearStyle) => {
    setError(null);
    onChange(updateDicebearStyle(avatar, style));
  };

  const handleApplySeed = () => {
    setError(null);
    onChange(updateDicebearSeed(avatar, seedInput || displayName || "anonymous"));
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const uploaded = await createUploadedAvatarPreference(file);
      onChange(uploaded);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Failed to upload avatar";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const previewUrl = resolveAvatarUrl(avatar);
  const isDicebear = avatar.type === "dicebear";

  return (
    <Card className="rounded-2xl border border-white/55 bg-white/45 shadow-[0_20px_50px_hsl(var(--foreground)/0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4" />
          Avatar
        </CardTitle>
        <CardDescription>
          Use DiceBear avatar or upload your own image (max {avatarUploadSizeLabel()}).
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/50 bg-white/55 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <img
            src={previewUrl}
            alt="Avatar preview"
            className="h-14 w-14 rounded-full border border-white/50 object-cover shadow-sm dark:border-white/10"
          />
          <div className="min-w-0">
            <p className="text-sm font-medium">Preview</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {isDicebear ? "DiceBear generated" : "Custom uploaded"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSwitchToDicebear}
            className={cn(
              "rounded-xl border px-3 py-2 text-left text-xs backdrop-blur-xl transition-colors",
              isDicebear
                ? "border-primary bg-primary/10 text-foreground"
                : "border-white/45 bg-white/55 hover:border-primary/50 dark:border-white/10 dark:bg-white/5"
            )}
          >
            DiceBear
          </button>

          <label
            className={cn(
              "flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs backdrop-blur-xl transition-colors",
              !isDicebear
                ? "border-primary bg-primary/10 text-foreground"
                : "border-white/45 bg-white/55 hover:border-primary/50 dark:border-white/10 dark:bg-white/5",
              busy && "pointer-events-none opacity-60"
            )}
          >
            <Upload className="h-3.5 w-3.5" />
            {busy ? "Uploading..." : "Upload"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleUpload}
              disabled={busy}
            />
          </label>
        </div>

        {isDicebear && (
          <div className="space-y-3 rounded-xl border border-white/45 bg-white/50 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="grid gap-2">
              {DICEBEAR_STYLE_OPTIONS.map((option) => {
                const active = avatar.style === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleDicebearStyle(option.value)}
                    className={cn(
                      "rounded-lg border px-2.5 py-2 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/10"
                        : "border-white/50 bg-white/60 hover:border-primary/45 dark:border-white/10 dark:bg-white/5"
                    )}
                  >
                    <p className="text-xs font-medium">{option.label}</p>
                    <p className="text-[11px] text-muted-foreground">{option.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground">Seed / nickname</label>
              <div className="flex items-center gap-2">
                <Input
                  value={seedInput}
                  onChange={(event) => setSeedInput(event.target.value)}
                  onBlur={handleApplySeed}
                  maxLength={32}
                  className="h-9 border-white/50 bg-white/60 text-xs dark:border-white/10 dark:bg-white/10"
                  placeholder="anonymous"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleApplySeed}
                  className="h-9"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        )}

        {!isDicebear && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleSwitchToDicebear}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to DiceBear
          </Button>
        )}

        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
