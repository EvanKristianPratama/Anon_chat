"use client";

import { MessageCircle } from "lucide-react";

export function ChatEmptyState() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-4 py-16">
            <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-2xl" />
                <div className="relative rounded-2xl border border-border/40 bg-card/30 p-5 backdrop-blur-sm">
                    <MessageCircle className="h-10 w-10 text-muted-foreground/60" strokeWidth={1.5} />
                </div>
            </div>
            <div className="space-y-1.5 text-center">
                <p className="text-sm font-medium text-muted-foreground">No messages yet</p>
                <p className="max-w-[240px] text-xs text-muted-foreground/70">
                    Tap <span className="font-semibold text-primary">New Chat</span> to find a random stranger and start chatting anonymously.
                </p>
            </div>
        </div>
    );
}
