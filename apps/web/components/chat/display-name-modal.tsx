"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { normalizeDisplayName } from "@/lib/user-preferences";

interface DisplayNameModalProps {
    initialDisplayName: string;
    onSave: (displayName: string) => void;
}

export function DisplayNameModal({ initialDisplayName, onSave }: DisplayNameModalProps) {
    const [inputValue, setInputValue] = useState(initialDisplayName);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const normalized = normalizeDisplayName(inputValue);
        if (normalized.length < 2) return;
        onSave(normalized);
    };

    return (
        <div className="fixed inset-0 z-50 flex animate-modal-in items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl border border-border bg-background p-6 shadow-lg">
                <div className="mb-5 flex flex-col items-center gap-3">
                    <div className="rounded-full border border-border p-3">
                        <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-base font-semibold">Set your alias</h2>
                        <p className="mt-1 text-xs text-muted-foreground">Your anonymous identity in chat</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Display name</label>
                        <input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            maxLength={24}
                            placeholder="e.g. night fox"
                            autoFocus
                            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <p className="text-[11px] text-muted-foreground">2-24 characters</p>
                    </div>

                    <button
                        type="submit"
                        className="h-9 w-full rounded-md bg-foreground text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-40"
                        disabled={normalizeDisplayName(inputValue).length < 2}
                    >
                        Start chatting
                    </button>
                </form>
            </div>
        </div>
    );
}
