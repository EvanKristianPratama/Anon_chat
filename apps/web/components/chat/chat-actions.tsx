"use client";

import { Shuffle, SkipForward, Loader2 } from "lucide-react";
import type { QueueState } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatActionsProps {
    canInteract: boolean;
    queueState: QueueState;
    onNext: () => void;
    onSkip: () => void;
}

export function ChatActions({ canInteract, queueState, onNext, onSkip }: ChatActionsProps) {
    const isWaiting = queueState === "waiting";
    const isMatched = queueState === "matched";

    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={onNext}
                disabled={!canInteract || isWaiting}
                className={cn(
                    "gap-2 rounded-xl px-5 transition-all duration-200",
                    isWaiting && "animate-pulse"
                )}
            >
                {isWaiting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Shuffle className="h-4 w-4" />
                )}
                {isWaiting ? "Searching…" : "New Chat"}
            </Button>

            <Button
                variant="outline"
                onClick={onSkip}
                disabled={!canInteract || !isMatched}
                className="gap-2 rounded-xl border-border/40 px-5 text-muted-foreground transition-all duration-200 hover:border-destructive/40 hover:text-destructive"
            >
                <SkipForward className="h-4 w-4" />
                Skip
            </Button>
        </div>
    );
}
