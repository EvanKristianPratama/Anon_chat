"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DisplayNameModalProps {
    initialDisplayName: string;
    onSave: (displayName: string) => void;
}

const normalizeDisplayName = (value: string): string =>
    value.trim().replace(/\s+/g, " ").slice(0, 24);

export function DisplayNameModal({ initialDisplayName, onSave }: DisplayNameModalProps) {
    const [inputValue, setInputValue] = useState(initialDisplayName);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const normalized = normalizeDisplayName(inputValue);
        if (normalized.length < 2) return;
        onSave(normalized);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-lg animate-modal-in">
            <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/40 bg-card/80 shadow-2xl shadow-black/30 backdrop-blur-xl">
                {/* Header accent */}
                <div className="relative h-24 overflow-hidden bg-gradient-to-br from-primary/30 via-accent/20 to-transparent">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzEuMTA1IDAgMi0uODk1IDItMnMtLjg5NS0yLTItMi0yIC44OTUtMiAyIC44OTUgMiAyIDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
                    <div className="absolute bottom-4 left-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl border border-white/10 bg-white/10 p-2.5 backdrop-blur-sm">
                                <KeyRound className="h-5 w-5 text-white/80" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Set Nama Samaran</h2>
                                <p className="text-xs text-white/60">Identitas anonim kamu di chat</p>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 p-5">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Nama Samaran</label>
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            maxLength={24}
                            placeholder="contoh: night fox"
                            autoFocus
                            className="h-11 rounded-xl border-border/40 bg-background/40 text-sm"
                        />
                        <p className="text-[11px] text-muted-foreground/60">2-24 karakter, spasi otomatis dirapikan</p>
                    </div>

                    <div className="rounded-xl border border-border/30 bg-muted/20 p-4">
                        <div className="mb-2 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <p className="text-xs font-semibold text-foreground">Privacy Guardrails</p>
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                            <li>• Messages limited to 500 chars</li>
                            <li>• Images max 1 MB (jpeg/png/webp)</li>
                            <li>• Auto-cleanup on idle & max session</li>
                            <li>• Zero message persistence</li>
                        </ul>
                    </div>

                    <Button
                        type="submit"
                        className="w-full rounded-xl py-2.5 font-medium shadow-lg shadow-primary/20"
                        disabled={normalizeDisplayName(inputValue).length < 2}
                    >
                        Simpan dan Mulai
                    </Button>
                </form>
            </div>
        </div>
    );
}
