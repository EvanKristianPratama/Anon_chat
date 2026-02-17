"use client";

import { MessageCircle } from "lucide-react";

export function ChatEmptyState() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3">
            <div className="rounded-full border border-border p-4">
                <MessageCircle className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <div className="space-y-1 text-center">
                <p className="text-sm font-medium">No messages yet</p>
                <p className="max-w-[220px] text-xs text-muted-foreground">
                    Tap <span className="font-medium text-foreground">Next</span> to find a random partner.
                </p>
            </div>
        </div>
    );
}
