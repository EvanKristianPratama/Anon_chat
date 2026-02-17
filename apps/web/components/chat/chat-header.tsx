"use client";

import { UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QueueState } from "@/types/chat";
import { ConnectionBadge } from "@/components/chat/connection-badge";
import { Button } from "@/components/ui/button";

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
    return (
        <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 text-sm font-bold uppercase text-primary">
                        {displayName ? displayName[0] : "?"}
                    </div>
                    <div
                        className={cn(
                            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
                            connected ? "bg-emerald-500" : "bg-red-500"
                        )}
                    />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{displayName || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                        {queueState === "matched" && partnerId
                            ? `Chatting with ${partnerAlias || "stranger"}`
                            : queueState === "waiting"
                                ? "Finding someone…"
                                : "Ready to chat"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <ConnectionBadge connected={connected} />
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onEditDisplayName}
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                >
                    <UserCircle2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
