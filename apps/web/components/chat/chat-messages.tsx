"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types/chat";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { ChatEmptyState } from "@/components/chat/chat-empty-state";

interface ChatMessagesProps {
    messages: Message[];
    displayName: string;
}

export function ChatMessages({ messages, displayName }: ChatMessagesProps) {
    const endRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages]);

    return (
        <div className="chat-scrollbar flex-1 overflow-y-auto rounded-xl border border-border/30 bg-background/20 p-3 backdrop-blur-sm">
            {messages.length === 0 ? (
                <ChatEmptyState />
            ) : (
                <div className="space-y-3">
                    {messages.map((msg) => (
                        <ChatBubble key={msg.id} message={msg} displayName={displayName} />
                    ))}
                    <div ref={endRef} />
                </div>
            )}
        </div>
    );
}
