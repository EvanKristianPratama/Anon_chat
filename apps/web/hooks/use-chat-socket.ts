"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { createSocket, type AppSocket } from "@/lib/socket";
import type { Message, QueueState } from "@/types/chat";
import { createMessageId } from "@/types/chat";

const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:4000";

function appendMessage(
    setter: Dispatch<SetStateAction<Message[]>>,
    msg: Message
): void {
    setter((prev) => [...prev.slice(-120), msg]);
}

function pushSystem(
    setter: Dispatch<SetStateAction<Message[]>>,
    text: string
): void {
    appendMessage(setter, { id: createMessageId(), kind: "system", text });
}

export interface UseChatSocketReturn {
    connected: boolean;
    queueState: QueueState;
    partnerId: string | null;
    partnerAlias: string | null;
    messages: Message[];
    joinQueue: (alias: string) => void;
    skip: () => void;
    sendText: (text: string, alias: string) => void;
    sendImage: (file: File, alias: string) => Promise<void>;
}

export function useChatSocket(): UseChatSocketReturn {
    const socketRef = useRef<AppSocket | null>(null);

    const [connected, setConnected] = useState(false);
    const [queueState, setQueueState] = useState<QueueState>("idle");
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [partnerAlias, setPartnerAlias] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        const socket = createSocket(wsUrl);
        socketRef.current = socket;

        socket.on("connect", () => {
            setConnected(true);
            pushSystem(setMessages, "Connected to server");
        });

        socket.on("disconnect", () => {
            setConnected(false);
            setQueueState("idle");
            setPartnerId(null);
            setPartnerAlias(null);
            pushSystem(setMessages, "Disconnected from server");
        });

        socket.on("queue:waiting", () => {
            setQueueState("waiting");
            setPartnerId(null);
            setPartnerAlias(null);
            pushSystem(setMessages, "Looking for someone to chat with…");
        });

        socket.on("room:matched", ({ partnerId: pid, partnerAlias: pa }) => {
            setQueueState("matched");
            setPartnerId(pid);
            setPartnerAlias(pa ?? null);
            pushSystem(setMessages, pa ? `Matched with ${pa}!` : "Matched with a stranger!");
        });

        socket.on("room:ended", ({ reason }) => {
            setQueueState("idle");
            setPartnerId(null);
            setPartnerAlias(null);
            pushSystem(setMessages, `Chat ended — ${reason}`);
        });

        socket.on("chat:text", ({ from, alias, text: incoming }) => {
            appendMessage(setMessages, {
                id: createMessageId(),
                kind: "text",
                from: alias ?? from,
                text: incoming,
            });
        });

        socket.on("chat:image", ({ from, alias, mime, bytes }) => {
            const typed = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
            const copy = new Uint8Array(typed.byteLength);
            copy.set(typed);
            const blob = new Blob([copy.buffer], { type: mime });
            const url = URL.createObjectURL(blob);
            appendMessage(setMessages, {
                id: createMessageId(),
                kind: "image",
                from: alias ?? from,
                url,
            });
        });

        socket.on("system:error", ({ code, message }) => {
            pushSystem(setMessages, `${code}: ${message}`);
        });

        socket.connect();

        const heartbeat = setInterval(() => {
            socket.emit("session:heartbeat");
        }, 15_000);

        return () => {
            clearInterval(heartbeat);
            socket.disconnect();
            socket.removeAllListeners();
            socketRef.current = null;
        };
    }, []);

    const joinQueue = useCallback((alias: string) => {
        socketRef.current?.emit("queue:join", { alias });
    }, []);

    const skip = useCallback(() => {
        socketRef.current?.emit("room:skip");
    }, []);

    const sendText = useCallback((text: string, alias: string) => {
        const value = text.trim();
        if (!value) return;
        socketRef.current?.emit("chat:text", { text: value });
        appendMessage(setMessages, {
            id: createMessageId(),
            kind: "text",
            from: alias,
            text: value,
        });
    }, []);

    const sendImage = useCallback(async (file: File, alias: string) => {
        if (!file.type.startsWith("image/")) {
            pushSystem(setMessages, "Only image files are allowed");
            return;
        }
        if (file.size > 1_000_000) {
            pushSystem(setMessages, "Image max size is 1 MB");
            return;
        }
        const mime = file.type as "image/jpeg" | "image/png" | "image/webp";
        if (!["image/jpeg", "image/png", "image/webp"].includes(mime)) {
            pushSystem(setMessages, "Allowed types: jpeg, png, webp");
            return;
        }
        const bytes = new Uint8Array(await file.arrayBuffer());
        socketRef.current?.emit("chat:image", { mime, bytes });
        const preview = URL.createObjectURL(file);
        appendMessage(setMessages, {
            id: createMessageId(),
            kind: "image",
            from: alias,
            url: preview,
        });
    }, []);

    return {
        connected,
        queueState,
        partnerId,
        partnerAlias,
        messages,
        joinQueue,
        skip,
        sendText,
        sendImage,
    };
}
