"use client";

import { Shuffle, SkipForward, Loader2 } from "lucide-react";
import type { QueueState } from "@/types/chat";

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
        <div className="mb-2 flex items-center gap-1.5">
            <button
                onClick={onNext}
                disabled={!canInteract || isWaiting}
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
            >
                {isWaiting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <Shuffle className="h-3 w-3" />
                )}
                {isWaiting ? "Searching..." : "Next"}
            </button>

            <button
                onClick={onSkip}
                disabled={!canInteract || !isMatched}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
                <SkipForward className="h-3 w-3" />
                Skip
            </button>
        </div>
    );
}
