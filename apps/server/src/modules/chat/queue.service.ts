import { Injectable } from "@nestjs/common";
import { RedisKeys } from "../../constants/redis-keys";
import type { QueueEntry } from "../../domain/chat.types";
import { RedisService } from "../../redis/redis.service";

const PAIR_POP_LUA = `
if redis.call("LLEN", KEYS[1]) < 2 then
  return {}
end
local first = redis.call("LPOP", KEYS[1])
local second = redis.call("LPOP", KEYS[1])
return { first, second }
`;

const serializeEntry = (entry: QueueEntry): string => JSON.stringify(entry);

const parseEntry = (raw: string): QueueEntry | null => {
    try {
        const parsed = JSON.parse(raw) as QueueEntry;
        if (!parsed.userId || !parsed.socketId || !parsed.enqueuedAt) {
            return null;
        }
        return parsed;
    } catch {
        return null;
    }
};

@Injectable()
export class QueueService {
    constructor(private readonly redis: RedisService) { }

    async enqueue(entry: QueueEntry): Promise<boolean> {
        const client = this.redis.client;
        const inserted = await client.sadd(RedisKeys.queueMembers, entry.userId);

        if (!inserted) {
            return false;
        }

        await client.rpush(RedisKeys.waitingQueue, serializeEntry(entry));
        return true;
    }

    async dequeuePair(): Promise<[QueueEntry, QueueEntry] | null> {
        const client = this.redis.client;
        const result = (await client.eval(PAIR_POP_LUA, 1, RedisKeys.waitingQueue)) as string[];

        if (!Array.isArray(result) || result.length < 2) {
            return null;
        }

        const first = parseEntry(result[0]);
        const second = parseEntry(result[1]);

        if (!first || !second) {
            return null;
        }

        await client.srem(RedisKeys.queueMembers, first.userId, second.userId);

        if (first.userId === second.userId) {
            await this.enqueue(first);
            return null;
        }

        return [first, second];
    }

    async removeUser(userId: string): Promise<void> {
        await this.redis.client.srem(RedisKeys.queueMembers, userId);
    }
}
