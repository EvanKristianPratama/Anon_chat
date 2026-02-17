"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { ImagePlus, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
                "flex items-center gap-2 rounded-2xl border border-border/40 bg-card/30 p-1.5 backdrop-blur-sm transition-all duration-200",
                !disabled && "focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20"
            )}
        >
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                className="relative h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground"
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
            </Button>

            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={disabled ? "Connect first…" : "Type a message…"}
                maxLength={500}
                disabled={disabled}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed"
            />

            <Button
                type="submit"
                size="icon"
                disabled={disabled || !text.trim()}
                className={cn(
                    "h-9 w-9 shrink-0 rounded-xl transition-all duration-200",
                    text.trim()
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-muted/40 text-muted-foreground"
                )}
            >
                <Send className="h-4 w-4" />
            </Button>
        </form>
    );
}
