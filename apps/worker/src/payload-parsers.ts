import { isObjectRecord } from "./utils";
import type {
  AdminSubscribePayload,
  ChatImagePayload,
  ChatTextPayload,
  QueueJoinPayload
} from "./types";

export const parseQueueJoinPayload = (rawPayload: unknown): QueueJoinPayload | null => {
  if (!isObjectRecord(rawPayload)) {
    return null;
  }

  if ("alias" in rawPayload && typeof rawPayload.alias !== "string") {
    return null;
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
