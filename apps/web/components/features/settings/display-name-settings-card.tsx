"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { normalizeDisplayName } from "@/lib/user-preferences";

interface DisplayNameSettingsCardProps {
  displayName: string;
  onSave: (nextDisplayName: string) => void;
}

export function DisplayNameSettingsCard({ displayName, onSave }: DisplayNameSettingsCardProps) {
  const [value, setValue] = useState(displayName);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setValue(displayName);
  }, [displayName]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = normalizeDisplayName(value);
    if (normalized.length < 2) {
      return;
    }

    onSave(normalized);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  return (
    <Card className="rounded-2xl border border-white/55 bg-white/45 shadow-[0_20px_50px_hsl(var(--foreground)/0.12)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserRound className="h-4 w-4" />
          Profile
        </CardTitle>
        <CardDescription>Set your anonymous display name for chat sessions.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="e.g. night fox"
            maxLength={24}
            className="border-white/50 bg-white/60 dark:border-white/10 dark:bg-white/10"
          />
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground">2-24 chars, spaces auto-normalized</p>
            <Button
              type="submit"
              disabled={normalizeDisplayName(value).length < 2}
              className="min-w-[96px]"
            >
              {saved ? "Saved" : "Save name"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
