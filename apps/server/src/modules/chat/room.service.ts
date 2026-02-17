import { Injectable } from "@nestjs/common";
import type { EndReason } from "@anon/contracts";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env";
import { RedisKeys } from "../../constants/redis-keys";
import type { EndRoomResult, QueueEntry, RoomRecord } from "../../domain/chat.types";
import { RedisService } from "../../redis/redis.service";
import { MetricsService } from "../../services/metrics.service";

const ROOM_TTL_SEC = env.maxSessionSec + 120;

const parseRoom = (roomId: string, raw: Record<string, string>): RoomRecord | null => {
    if (!raw.userA || !raw.userB || !raw.socketA || !raw.socketB || !raw.startedAt || !raw.lastActivityAt) {
        return null;
    }

    return {
        roomId,
        userA: raw.userA,
        userB: raw.userB,
        socketA: raw.socketA,
        socketB: raw.socketB,
        startedAt: Number(raw.startedAt),
        lastActivityAt: Number(raw.lastActivityAt),
        status: raw.status === "ending" ? "ending" : "active",
    };
};

@Injectable()
export class RoomService {
    constructor(
        private readonly redis: RedisService,
        private readonly metrics: MetricsService,
    ) { }

    async create(first: QueueEntry, second: QueueEntry): Promise<RoomRecord> {
        const client = this.redis.client;
        const roomId = randomUUID();
        const now = Date.now();

        const room: RoomRecord = {
            roomId,
            userA: first.userId,
            userB: second.userId,
            socketA: first.socketId,
            socketB: second.socketId,
            startedAt: now,
            lastActivityAt: now,
            status: "active",
        };

        await client
            .multi()
            .hset(RedisKeys.room(roomId), {
                userA: room.userA,
                userB: room.userB,
                socketA: room.socketA,
                socketB: room.socketB,
                startedAt: String(room.startedAt),
                lastActivityAt: String(room.lastActivityAt),
                status: room.status,
            })
            .expire(RedisKeys.room(roomId), ROOM_TTL_SEC)
            .set(RedisKeys.userRoom(room.userA), roomId, "EX", ROOM_TTL_SEC)
            .set(RedisKeys.userRoom(room.userB), roomId, "EX", ROOM_TTL_SEC)
            .sadd(RedisKeys.activeRoomsSet, roomId)
            .exec();

        await this.metrics.onRoomStarted();
        return room;
    }

    async findByUser(userId: string): Promise<RoomRecord | null> {
        const client = this.redis.client;
        const roomId = await client.get(RedisKeys.userRoom(userId));

        if (!roomId) {
            return null;
        }

        const raw = await client.hgetall(RedisKeys.room(roomId));
        const room = parseRoom(roomId, raw);

        if (!room) {
            await client.del(RedisKeys.userRoom(userId));
            return null;
        }

        return room;
    }

    async touch(userId: string): Promise<void> {
        const room = await this.findByUser(userId);
        if (!room) {
            return;
        }

        await this.redis.client.hset(
            RedisKeys.room(room.roomId),
            "lastActivityAt",
            String(Date.now()),
        );
    }

    async endByUser(userId: string, reason: EndReason): Promise<EndRoomResult | null> {
        const room = await this.findByUser(userId);
        if (!room) {
            return null;
        }
        return this.endById(room.roomId, reason);
    }

    async disconnect(userId: string): Promise<EndRoomResult | null> {
        return this.endByUser(userId, "disconnect");
    }

    async endById(roomId: string, reason: EndReason): Promise<EndRoomResult | null> {
        const client = this.redis.client;
        const lock = await client.set(RedisKeys.roomLock(roomId), "1", "EX", 5, "NX");

        if (!lock) {
            return null;
        }

        try {
            const raw = await client.hgetall(RedisKeys.room(roomId));
            const room = parseRoom(roomId, raw);

            if (!room) {
                return null;
            }

            await client
                .multi()
                .del(RedisKeys.room(roomId))
                .del(RedisKeys.userRoom(room.userA))
                .del(RedisKeys.userRoom(room.userB))
                .srem(RedisKeys.activeRoomsSet, roomId)
                .exec();

            await this.metrics.onRoomEnded(Date.now() - room.startedAt);
            return { room, reason };
        } finally {
            await client.del(RedisKeys.roomLock(roomId));
        }
    }

    async sweepExpired(): Promise<number> {
        const client = this.redis.client;
        const roomIds = await client.smembers(RedisKeys.activeRoomsSet);

        if (roomIds.length === 0) {
            return 0;
        }

        let ended = 0;
        const now = Date.now();

        for (const roomId of roomIds) {
            const raw = await client.hgetall(RedisKeys.room(roomId));
            const room = parseRoom(roomId, raw);

            if (!room) {
                await client.srem(RedisKeys.activeRoomsSet, roomId);
                continue;
            }

            const idleMs = now - room.lastActivityAt;
            const durationMs = now - room.startedAt;

            if (idleMs > env.idleTimeoutSec * 1000) {
                const result = await this.endById(roomId, "timeout");
                if (result) ended += 1;
                continue;
            }

            if (durationMs > env.maxSessionSec * 1000) {
                const result = await this.endById(roomId, "max_duration");
                if (result) ended += 1;
            }
        }

        return ended;
    }

    /**
     * Resolves the partner's socket ID for a given user in a room.
     */
    resolvePartnerSocket(room: RoomRecord, userId: string): string {
        return room.userA === userId ? room.socketB : room.socketA;
    }

    resolvePartnerId(room: RoomRecord, userId: string): string {
        return room.userA === userId ? room.userB : room.userA;
    }
}
