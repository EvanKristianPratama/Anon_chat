"use client";

import type { QueueState } from "@/types/chat";

interface ChatHeaderProps {
    partnerId: string | null;
    partnerAlias: string | null;
    queueState: QueueState;
}

export function ChatHeader({
    partnerId,
    partnerAlias,
    queueState,
}: ChatHeaderProps) {
    const subtitle =
        queueState === "matched" && partnerId
            ? `Chatting with ${partnerAlias || "stranger"}`
            : queueState === "waiting"
                ? "Finding someone..."
                : "Ready to chat";

    return (
        <div className="border-b border-border px-3 py-2.5 md:px-4">
            <div className="min-w-0">
                <p className="truncate text-sm font-medium">{partnerAlias || "Stranger"}</p>
                <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
            </div>
        </div>
    );
}
