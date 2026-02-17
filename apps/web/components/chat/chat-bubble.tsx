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
                <p className="max-w-[80%] rounded-full border border-border/40 bg-muted/30 px-3 py-1 text-center text-[11px] text-muted-foreground backdrop-blur-sm">
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
                        "group max-w-[75%] overflow-hidden rounded-2xl border p-1.5",
                        isMine
                            ? "rounded-br-md border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5"
                            : "rounded-bl-md border-border/40 bg-card/50"
                    )}
                >
                    <div className="mb-1 flex items-center gap-2 px-1.5">
                        <div
                            className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold uppercase",
                                isMine
                                    ? "bg-primary/30 text-primary"
                                    : "bg-accent/30 text-accent"
                            )}
                        >
                            {message.from[0]}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{message.from}</span>
                    </div>
                    <img
                        src={message.url}
                        alt="shared image"
                        className="max-h-64 w-full rounded-xl object-contain"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex animate-message-in", isMine ? "justify-end" : "justify-start")}>
            <div className="flex max-w-[75%] items-end gap-2">
                {!isMine && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[11px] font-bold uppercase text-accent">
                        {message.from[0]}
                    </div>
                )}
                <div
                    className={cn(
                        "rounded-2xl px-3.5 py-2.5",
                        isMine
                            ? "rounded-br-md bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                            : "rounded-bl-md border border-border/40 bg-card/60 backdrop-blur-sm"
                    )}
                >
                    {!isMine && (
                        <p className="mb-0.5 text-[10px] font-medium text-muted-foreground">{message.from}</p>
                    )}
                    <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
                {isMine && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[11px] font-bold uppercase text-primary">
                        {displayName[0]}
                    </div>
                )}
            </div>
        </div>
    );
}
