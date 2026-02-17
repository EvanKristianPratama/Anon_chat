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
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300",
                connected
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-red-500/30 bg-red-500/10 text-red-400",
                className
            )}
        >
            <span className="relative flex h-2 w-2">
                <span
                    className={cn(
                        "absolute inline-flex h-full w-full rounded-full opacity-75",
                        connected ? "animate-ping bg-emerald-400" : "bg-red-400"
                    )}
                />
                <span
                    className={cn(
                        "relative inline-flex h-2 w-2 rounded-full",
                        connected ? "bg-emerald-500" : "bg-red-500"
                    )}
                />
            </span>
            {connected ? "Online" : "Offline"}
        </div>
    );
}
