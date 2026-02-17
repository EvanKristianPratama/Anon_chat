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
        <div className="chat-scrollbar flex h-full flex-col overflow-y-auto px-3 py-4 md:px-6">
            {messages.length === 0 ? (
                <ChatEmptyState />
            ) : (
                <div className="mx-auto w-full max-w-2xl space-y-3">
                    {messages.map((msg) => (
                        <ChatBubble key={msg.id} message={msg} displayName={displayName} />
                    ))}
                    <div ref={endRef} />
                </div>
            )}
        </div>
    );
}
