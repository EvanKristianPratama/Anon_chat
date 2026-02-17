import { isObjectRecord } from "./utils";
import type {
  AdminSubscribePayload,
  ChatImagePayload,
  ChatTextPayload,
  QueueJoinPayload
} from "./types";

const isQueueJoinAvatarPayload = (value: unknown): boolean => {
  if (!isObjectRecord(value) || typeof value.type !== "string") {
    return false;
  }

  if (value.type === "dicebear") {
    const hasValidStyle = value.style === undefined || typeof value.style === "string";
    const hasValidSeed = value.seed === undefined || typeof value.seed === "string";
    return hasValidStyle && hasValidSeed;
  }

  if (value.type === "custom") {
    return typeof value.mime === "string" && typeof value.data === "string";
  }

  return false;
};

export const parseQueueJoinPayload = (rawPayload: unknown): QueueJoinPayload | null => {
  if (!isObjectRecord(rawPayload)) {
    return null;
  }

  if ("alias" in rawPayload && typeof rawPayload.alias !== "string") {
    return null;
  }

  if ("avatar" in rawPayload && rawPayload.avatar !== undefined) {
    if (!isQueueJoinAvatarPayload(rawPayload.avatar)) {
      return null;
    }
  }

  return rawPayload as QueueJoinPayload;
};

export const parseChatTextPayload = (rawPayload: unknown): ChatTextPayload | null => {
  if (!isObjectRecord(rawPayload)) {
    return null;
  }

  if (typeof rawPayload.text !== "string") {
    return null;
  }

  return rawPayload as ChatTextPayload;
};

export const parseChatImagePayload = (rawPayload: unknown): ChatImagePayload | null => {
  if (!isObjectRecord(rawPayload)) {
    return null;
  }

  const mime = rawPayload.mime;
  const data = rawPayload.data;

  if (mime !== undefined && typeof mime !== "string") {
    return null;
  }

  if (data !== undefined && typeof data !== "string") {
    return null;
  }

  return rawPayload as ChatImagePayload;
};

export const parseAdminSubscribePayload = (rawPayload: unknown): AdminSubscribePayload | null => {
  if (!isObjectRecord(rawPayload)) {
    return null;
  }

  if (typeof rawPayload.token !== "string") {
    return null;
  }

  return rawPayload as AdminSubscribePayload;
};
