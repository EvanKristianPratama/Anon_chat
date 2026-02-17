export type QueueState = "idle" | "waiting" | "matched";

export type Message =
    | { id: string; kind: "system"; text: string }
    | { id: string; kind: "text"; from: string; text: string; avatarUrl?: string }
    | { id: string; kind: "image"; from: string; url: string; avatarUrl?: string };

export const createMessageId = (): string =>
    `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
