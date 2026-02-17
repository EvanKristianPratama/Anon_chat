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
                "flex items-end gap-2 rounded-xl border border-border bg-card p-2 transition-colors",
                !disabled && "focus-within:border-ring"
            )}
        >
            <label
                className={cn(
                    "relative flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
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
                className="min-w-0 flex-1 bg-transparent px-1 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
            />

            <button
                type="submit"
                disabled={disabled || !text.trim()}
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all",
                    text.trim()
                        ? "bg-foreground text-background hover:opacity-80"
                        : "text-muted-foreground opacity-40"
                )}
            >
                <ArrowUp className="h-4 w-4" />
            </button>
        </form>
    );
}
