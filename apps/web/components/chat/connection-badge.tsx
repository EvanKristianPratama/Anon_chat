"use client";

import { cn } from "@/lib/utils";

interface ConnectionBadgeProps {
    connected: boolean;
    className?: string;
}

export function ConnectionBadge({ connected, className }: ConnectionBadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 text-[10px] font-medium",
                connected
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-muted-foreground",
                className
            )}
        >
            <span
                className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    connected ? "bg-emerald-500" : "bg-neutral-400"
                )}
            />
            {connected ? "Online" : "Offline"}
        </div>
    );
}
