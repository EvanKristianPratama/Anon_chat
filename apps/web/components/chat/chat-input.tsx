"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { ImagePlus, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    disabled: boolean;
    onSendText: (text: string) => void;
    onSendImage: (file: File) => void;
}

export function ChatInput({ disabled, onSendText, onSendImage }: ChatInputProps) {
    const [text, setText] = useState("");

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const value = text.trim();
        if (!value) return;
        onSendText(value);
        setText("");
    };

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                "flex items-center gap-2 rounded-full border border-white/55 bg-white/55 px-2 py-1.5 shadow-[0_10px_30px_hsl(var(--foreground)/0.1)] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/5",
                !disabled && "focus-within:border-ring/70"
            )}
        >
            <label
                className={cn(
                    "relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/45 bg-white/60 text-muted-foreground transition-colors hover:text-foreground dark:border-white/10 dark:bg-white/5",
                    disabled && "pointer-events-none opacity-40"
                )}
            >
                <ImagePlus className="h-4 w-4" />
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={disabled}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onSendImage(file);
                        e.target.value = "";
                    }}
                />
            </label>

            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={disabled ? "Connect first..." : "Type a message..."}
                maxLength={500}
                disabled={disabled}
                className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm text-foreground placeholder:text-muted-foreground/80 focus:outline-none disabled:cursor-not-allowed"
            />

            <button
                type="submit"
                disabled={disabled || !text.trim()}
                className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",
                    text.trim()
                        ? "bg-foreground text-background hover:opacity-85"
                        : "text-muted-foreground opacity-40"
                )}
            >
                <ArrowUp className="h-4 w-4" />
            </button>
        </form>
    );
}
