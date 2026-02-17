"use client";

import { UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QueueState } from "@/types/chat";
import { ConnectionBadge } from "@/components/chat/connection-badge";

interface ChatHeaderProps {
    displayName: string;
    partnerId: string | null;
    partnerAlias: string | null;
    connected: boolean;
    queueState: QueueState;
    onEditDisplayName: () => void;
}

export function ChatHeader({
    displayName,
    partnerId,
    partnerAlias,
    connected,
    queueState,
    onEditDisplayName,
}: ChatHeaderProps) {
    const subtitle =
        queueState === "matched" && partnerId
            ? `Chatting with ${partnerAlias || "stranger"}`
            : queueState === "waiting"
                ? "Finding someone..."
                : "Ready to chat";

    return (
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5 md:px-4">
            <div className="flex min-w-0 items-center gap-2.5">
                <div className="relative">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-bold uppercase text-background">
                        {displayName ? displayName[0] : "?"}
                    </div>
                    <div
                        className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
                            connected ? "bg-emerald-500" : "bg-neutral-400"
                        )}
                    />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{partnerAlias || "Stranger"}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                <ConnectionBadge connected={connected} />
                <button
                    onClick={onEditDisplayName}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                    <UserCircle2 className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
