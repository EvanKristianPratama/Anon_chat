"use client";

import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

interface ChatBubbleProps {
    message: Message;
    displayName: string;
}

export function ChatBubble({ message, displayName }: ChatBubbleProps) {
    if (message.kind === "system") {
        return (
            <div className="flex justify-center animate-message-in">
                <p className="rounded-full border border-border bg-card px-3 py-1 text-center text-[11px] text-muted-foreground">
                    {message.text}
                </p>
            </div>
        );
    }

    const isMine = message.from === displayName;

    if (message.kind === "image") {
        return (
            <div className={cn("flex animate-message-in", isMine ? "justify-end" : "justify-start")}>
                <div
                    className={cn(
                        "max-w-[75%] overflow-hidden rounded-2xl",
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
        );
    }

    return (
        <div className={cn("flex animate-message-in", isMine ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2",
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
    );
}
