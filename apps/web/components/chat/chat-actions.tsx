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
    const isIdle = queueState === "idle";
    const isWaiting = queueState === "waiting";

    return (
        <div className="mb-2 flex items-center gap-1.5">
            {isIdle ? (
                <button
                    onClick={onNext}
                    disabled={!canInteract}
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-all hover:opacity-85 disabled:opacity-40"
                >
                    <Shuffle className="h-3.5 w-3.5" />
                    Next
                </button>
            ) : (
                <button
                    onClick={onSkip}
                    disabled={!canInteract}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-4 py-2 text-xs font-medium text-foreground backdrop-blur-sm transition-all hover:border-foreground/25 disabled:opacity-40"
                >
                    {isWaiting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <SkipForward className="h-3.5 w-3.5" />}
                    Skip
                </button>
            )}
        </div>
    );
}
