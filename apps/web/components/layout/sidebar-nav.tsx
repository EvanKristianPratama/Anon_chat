"use client";

import { useState } from "react";
import {
  Settings,
  LogIn,
  BadgeCheck,
  X,
  ChevronRight,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buildDicebearAvatarUrl } from "@/lib/avatar";
import { CreditsModal } from "@/components/layout/credits-modal";
import type { QueueState } from "@/types/chat";

interface SidebarNavProps {
  displayName: string;
  selfAvatarUrl?: string;
  queueState: QueueState;
  partnerAlias: string | null;
  partnerAvatar: string | null;
  open: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

export function SidebarNav({
  displayName,
  selfAvatarUrl,
  queueState,
  partnerAlias,
  partnerAvatar,
  open,
  collapsed,
  onToggleCollapse,
  onClose
}: SidebarNavProps) {
  const [tab, setTab] = useState<"chat" | "faq">("chat");
  const [creditsOpen, setCreditsOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const pathname = usePathname();
  const isDark = resolvedTheme === "dark";
  const isSettingsPage = pathname === "/settings";

  const isMatched = queueState === "matched";
  const isWaiting = queueState === "waiting";
  const sessionTitle = isMatched ? (partnerAlias || "Stranger") : "Stranger";
  const sessionSubtitle = isMatched ? "Connected" : isWaiting ? "Finding someone..." : "Ready to start";
  const aliasValue = displayName || "Anonymous";

  const currentSessionAvatar =
    (isMatched ? partnerAvatar : null) ??
    buildDicebearAvatarUrl("avataaars", sessionTitle);

  const myAvatar = selfAvatarUrl ?? buildDicebearAvatarUrl("avataaars", aliasValue);
  const desktopCollapseLabel = collapsed ? "Expand sidebar" : "Minimize sidebar";

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={onClose} />}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-[hsl(var(--sidebar))] transition-transform duration-200 md:relative md:translate-x-0 md:transition-[width] md:duration-200",
          open ? "translate-x-0 animate-slide-in" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-[84px]" : "md:w-[280px]"
        )}
      >
        <div className={cn("flex items-center border-b border-border px-4 py-3", collapsed && "md:px-2")}>
          <Link href="/" className={cn("flex min-w-0 items-center gap-2", collapsed && "md:mx-auto")}>
            <Image
              src="/logo.png"
              alt="Anotalk logo"
              width={22}
              height={22}
              className="rounded-md"
              priority
            />
            <span className={cn("truncate text-sm font-semibold", collapsed && "md:hidden")}>Anotalk</span>
          </Link>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              className="hidden rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground md:inline-flex"
              aria-label={desktopCollapseLabel}
              title={desktopCollapseLabel}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className={cn("flex border-b border-border", collapsed && "md:hidden")}>
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

        <div className={cn("flex-1 overflow-y-auto p-4", collapsed && "md:hidden")}>
          {tab === "chat" ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Session</p>

              <div className="rounded-xl border border-white/50 bg-white/45 p-3 shadow-[0_12px_30px_hsl(var(--foreground)/0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center gap-2">
                  <img
                    src={currentSessionAvatar}
                    alt={`${sessionTitle} avatar`}
                    className="h-9 w-9 rounded-full border border-white/45 object-cover shadow-sm dark:border-white/10"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{sessionTitle}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{sessionSubtitle}</p>
                  </div>
                  <span className="ml-auto rounded-full border border-white/50 bg-white/65 px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:border-white/10 dark:bg-white/10">
                    {queueState}
                  </span>
                </div>

                <div className="mt-2 border-t border-border/60 pt-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={myAvatar}
                      alt="Your avatar"
                      className="h-6 w-6 rounded-full border border-white/40 object-cover dark:border-white/10"
                    />
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">You</p>
                      <p className="truncate text-xs font-medium">{aliasValue}</p>
                    </div>
                  </div>
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
                  Send text or images. All messages are ephemeral, nothing is stored.
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

        {collapsed && (
          <div className="hidden flex-1 flex-col items-center gap-3 overflow-y-auto p-2 md:flex">
            <img
              src={currentSessionAvatar}
              alt={`${sessionTitle} avatar`}
              className="h-10 w-10 rounded-full border border-white/45 object-cover shadow-sm dark:border-white/10"
              title={sessionTitle}
            />
            <span
              className="rounded-full border border-white/45 bg-white/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:border-white/10 dark:bg-white/10"
              title={sessionSubtitle}
            >
              {queueState}
            </span>
            <img
              src={myAvatar}
              alt="Your avatar"
              className="h-8 w-8 rounded-full border border-white/40 object-cover dark:border-white/10"
              title={aliasValue}
            />
          </div>
        )}

        <div className={cn("space-y-2 border-t border-border p-4", collapsed && "md:hidden")}>
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors",
              isSettingsPage
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Link>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {isDark ? "Light mode" : "Dark mode"}
          </button>

          <button
            onClick={() => setCreditsOpen(true)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            Credits
          </button>

          <button
            disabled
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground opacity-50"
          >
            <LogIn className="h-3.5 w-3.5" />
            Login (coming soon)
          </button>
        </div>

        {collapsed && (
          <div className="hidden border-t border-border p-2 md:flex md:flex-col md:items-center md:gap-2">
            <Link
              href="/settings"
              onClick={onClose}
              title="Settings"
              aria-label="Settings"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md transition-colors",
                isSettingsPage
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Settings className="h-4 w-4" />
            </Link>

            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={isDark ? "Light mode" : "Dark mode"}
              aria-label={isDark ? "Light mode" : "Dark mode"}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setCreditsOpen(true)}
              title="Credits"
              aria-label="Credits"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <BadgeCheck className="h-4 w-4" />
            </button>

            <button
              disabled
              title="Login (coming soon)"
              aria-label="Login (coming soon)"
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground opacity-50"
            >
              <LogIn className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>

      <CreditsModal open={creditsOpen} onClose={() => setCreditsOpen(false)} />
    </>
  );
}
