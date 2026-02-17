"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { parseWsEnvelope, sendWsEvent, toWebSocketUrl } from "@/lib/ws";
import type { Message, QueueState } from "@/types/chat";
import { createMessageId } from "@/types/chat";

const wsBaseUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8787";
const userSocketUrl = toWebSocketUrl(wsBaseUrl, "/ws");

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
    const socketRef = useRef<WebSocket | null>(null);

    const [connected, setConnected] = useState(false);
    const [queueState, setQueueState] = useState<QueueState>("idle");
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [partnerAlias, setPartnerAlias] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);

    const sendEvent = useCallback((event: string, payload?: unknown): boolean => {
        const socket = socketRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            return false;
        }
        sendWsEvent(socket, event, payload);
        return true;
    }, []);

    useEffect(() => {
        const socket = new WebSocket(userSocketUrl);
        socketRef.current = socket;

        const onOpen = () => {
            setConnected(true);
            pushSystem(setMessages, "Connected to server");
        };

        const onClose = () => {
            setConnected(false);
            setQueueState("idle");
            setPartnerId(null);
            setPartnerAlias(null);
            pushSystem(setMessages, "Disconnected from server");
        };

        const onMessage = (event: MessageEvent) => {
            const envelope = parseWsEnvelope(event.data);
            if (!envelope) {
                return;
            }

            switch (envelope.event) {
                case "queue:waiting": {
                    setQueueState("waiting");
                    setPartnerId(null);
                    setPartnerAlias(null);
                    pushSystem(setMessages, "Looking for someone to chat with...");
                    return;
                }
                case "room:matched": {
                    const payload = envelope.payload as { partnerId: string; partnerAlias?: string };
                    setQueueState("matched");
                    setPartnerId(payload.partnerId);
                    setPartnerAlias(payload.partnerAlias ?? null);
                    pushSystem(
                        setMessages,
                        payload.partnerAlias
                            ? `Matched with ${payload.partnerAlias}!`
                            : "Matched with a stranger!"
                    );
                    return;
                }
                case "room:ended": {
                    const payload = envelope.payload as { reason: string };
                    setQueueState("idle");
                    setPartnerId(null);
                    setPartnerAlias(null);
                    pushSystem(setMessages, `Chat ended - ${payload.reason}`);
                    return;
                }
                case "chat:text": {
                    const payload = envelope.payload as { from: string; alias?: string; text: string };
                    appendMessage(setMessages, {
                        id: createMessageId(),
                        kind: "text",
                        from: payload.alias ?? payload.from,
                        text: payload.text,
                    });
                    return;
                }
                case "chat:image": {
                    const payload = envelope.payload as {
                        from: string;
                        alias?: string;
                        mime: "image/jpeg" | "image/png" | "image/webp";
                        data: string;
                    };
                    appendMessage(setMessages, {
                        id: createMessageId(),
                        kind: "image",
                        from: payload.alias ?? payload.from,
                        url: `data:${payload.mime};base64,${payload.data}`,
                    });
                    return;
                }
                case "system:error": {
                    const payload = envelope.payload as { code: string; message: string };
                    pushSystem(setMessages, `${payload.code}: ${payload.message}`);
                    return;
                }
                default:
                    return;
            }
        };

        const heartbeat = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                sendWsEvent(socket, "session:heartbeat");
            }
        }, 15_000);

        socket.addEventListener("open", onOpen);
        socket.addEventListener("close", onClose);
        socket.addEventListener("message", onMessage);

        return () => {
            clearInterval(heartbeat);
            socket.removeEventListener("open", onOpen);
            socket.removeEventListener("close", onClose);
            socket.removeEventListener("message", onMessage);
            socket.close();
            socketRef.current = null;
        };
    }, []);

    const joinQueue = useCallback((alias: string) => {
        sendEvent("queue:join", { alias });
    }, [sendEvent]);

    const skip = useCallback(() => {
        sendEvent("room:skip");
    }, [sendEvent]);

    const sendText = useCallback((text: string, alias: string) => {
        const value = text.trim();
        if (!value) return;
        if (!sendEvent("chat:text", { text: value })) {
            return;
        }
        appendMessage(setMessages, {
            id: createMessageId(),
            kind: "text",
            from: alias,
            text: value,
        });
    }, [sendEvent]);

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result !== "string") {
                    reject(new Error("Invalid file encoding"));
                    return;
                }
                const [, base64] = reader.result.split(",", 2);
                if (!base64) {
                    reject(new Error("Invalid data URL"));
                    return;
                }
                resolve(base64);
            };
            reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
            reader.readAsDataURL(file);
        });

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

        const data = await fileToBase64(file);
        if (!sendEvent("chat:image", { mime, data })) {
            return;
        }

        const preview = URL.createObjectURL(file);
        appendMessage(setMessages, {
            id: createMessageId(),
            kind: "image",
            from: alias,
            url: preview,
        });
    }, [sendEvent]);

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
