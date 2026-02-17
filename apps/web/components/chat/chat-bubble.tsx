"use client";

import { cn } from "@/lib/utils";
import { buildDicebearAvatarUrl } from "@/lib/avatar";
import type { Message } from "@/types/chat";

interface ChatBubbleProps {
  message: Message;
  displayName: string;
  selfAvatarUrl: string;
  partnerAvatarUrl: string | null;
}

export function ChatBubble({
  message,
  displayName,
  selfAvatarUrl,
  partnerAvatarUrl
}: ChatBubbleProps) {
  if (message.kind === "system") {
    const isAlert = /NOT_|ERROR|RATE_LIMIT|SPAM|INVALID|DISCONNECT/i.test(message.text);

    return (
      <div className="flex justify-center animate-message-in">
        <div
          className={cn(
            "flex max-w-[88%] items-center gap-2 rounded-2xl border px-3 py-1.5 text-center text-[11px] font-medium shadow-[0_10px_28px_hsl(var(--foreground)/0.08)] backdrop-blur-xl",
            isAlert
              ? "border-destructive/35 bg-destructive/10 text-destructive"
              : "border-white/60 bg-white/65 text-muted-foreground dark:border-white/10 dark:bg-white/10"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 shrink-0 rounded-full",
              isAlert ? "bg-destructive" : "bg-primary/70"
            )}
          />
          <p>{message.text}</p>
        </div>
      </div>
    );
  }

  const isMine = message.from === displayName;
  const avatarUrl =
    (isMine ? selfAvatarUrl : message.avatarUrl ?? partnerAvatarUrl) ??
    buildDicebearAvatarUrl("avataaars", message.from);

  if (message.kind === "image") {
    return (
      <div className={cn("flex animate-message-in", isMine ? "justify-end" : "justify-start")}>
        <div className={cn("flex max-w-[82%] items-end", isMine ? "flex-row-reverse" : "gap-2")}>
          {!isMine && (
            <img
              src={avatarUrl}
              alt={`${message.from} avatar`}
              className="mb-1 h-7 w-7 shrink-0 rounded-full border border-white/40 object-cover shadow-sm dark:border-white/10"
              loading="lazy"
            />
          )}

          <div
            className={cn(
              "overflow-hidden rounded-2xl",
              isMine
                ? "rounded-br-sm bg-foreground text-background"
                : "rounded-bl-sm border border-border bg-card"
            )}
          >
            {!isMine && (
              <div className="px-3 pt-2">
                <span className="text-[11px] font-medium text-muted-foreground">{message.from}</span>
              </div>
            )}
            <div className="p-1.5">
              <img
                src={message.url}
                alt="shared image"
                className="max-h-64 w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex animate-message-in", isMine ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[82%] items-end", isMine ? "flex-row-reverse" : "gap-2")}>
        {!isMine && (
          <img
            src={avatarUrl}
            alt={`${message.from} avatar`}
            className="mb-1 h-7 w-7 shrink-0 rounded-full border border-white/40 object-cover shadow-sm dark:border-white/10"
            loading="lazy"
          />
        )}

        <div
          className={cn(
            "rounded-2xl px-3.5 py-2",
            isMine
              ? "rounded-br-sm bg-foreground text-background"
              : "rounded-bl-sm border border-border bg-card"
          )}
        >
          {!isMine && (
            <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">{message.from}</p>
          )}
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
      </div>
    </div>
  );
}
