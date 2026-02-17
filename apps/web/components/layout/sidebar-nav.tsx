"use client";

import { useState } from "react";
import {
  MessageCircle,
  HelpCircle,
  LogIn,
  X,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
  displayName: string;
  open: boolean;
  onClose: () => void;
}

export function SidebarNav({ displayName, open, onClose }: SidebarNavProps) {
  const [tab, setTab] = useState<"chat" | "faq">("chat");
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <>
      {/* Backdrop for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-[hsl(var(--sidebar))] transition-transform duration-200 md:relative md:translate-x-0",
          open ? "translate-x-0 animate-slide-in" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-semibold">Anon Chat</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User info */}
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold uppercase text-background">
              {displayName ? displayName[0] : "?"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{displayName || "Anonymous"}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setTab("chat")}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors",
              tab === "chat"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Chat
          </button>
          <button
            onClick={() => setTab("faq")}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors",
              tab === "faq"
                ? "border-b-2 border-foreground text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            How to Use
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === "chat" ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Active Session</p>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs text-muted-foreground">Connected</span>
                </div>
              </div>

              <p className="text-xs font-medium text-muted-foreground">Rules</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" />
                  Max 500 characters per message
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" />
                  Image max 1 MB
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" />
                  No message persistence
                </li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold">1. Set your alias</p>
                <p className="text-xs text-muted-foreground">
                  Enter a display name when prompted. This is your anonymous identity.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold">2. Find a partner</p>
                <p className="text-xs text-muted-foreground">
                  Tap the &quot;Next&quot; button to join the queue and get matched with a random stranger.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold">3. Chat freely</p>
                <p className="text-xs text-muted-foreground">
                  Send text or images. All messages are ephemeral — nothing is stored.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold">4. Skip anytime</p>
                <p className="text-xs text-muted-foreground">
                  Not vibing? Hit &quot;Skip&quot; to end the session and find someone new.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="space-y-2 border-t border-border p-4">
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {isDark ? "Light mode" : "Dark mode"}
          </button>
          <button
            disabled
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground opacity-50"
          >
            <LogIn className="h-3.5 w-3.5" />
            Login (coming soon)
          </button>
        </div>
      </aside>
    </>
  );
}
