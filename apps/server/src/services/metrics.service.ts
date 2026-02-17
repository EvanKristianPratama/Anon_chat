import { Injectable } from "@nestjs/common";
import type { AdminMetrics } from "@anon/contracts";
import { RedisKeys } from "../constants/redis-keys";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class MetricsService {
  constructor(private readonly redisService: RedisService) {}

  async onUserConnected(): Promise<void> {
    const redis = this.redisService.client;
    const online = await redis.incr(RedisKeys.metricsOnlineUsers);
    const peak = Number((await redis.get(RedisKeys.metricsPeakOnlineUsers)) ?? "0");

    if (online > peak) {
      await redis.set(RedisKeys.metricsPeakOnlineUsers, String(online));
    }
  }

  async onUserDisconnected(): Promise<void> {
    const redis = this.redisService.client;
    const online = await redis.decr(RedisKeys.metricsOnlineUsers);

    if (online < 0) {
      await redis.set(RedisKeys.metricsOnlineUsers, "0");
    }
  }

  async onRoomStarted(): Promise<void> {
    await this.redisService.client.incr(RedisKeys.metricsActiveRooms);
  }

  async onRoomEnded(durationMs: number): Promise<void> {
    const redis = this.redisService.client;
    const durationSec = Math.max(0, durationMs / 1000);

    const next = await redis.decr(RedisKeys.metricsActiveRooms);
    if (next < 0) {
      await redis.set(RedisKeys.metricsActiveRooms, "0");
    }

    await redis.incrbyfloat(RedisKeys.metricsSessionDurationSumSec, durationSec);
    await redis.incr(RedisKeys.metricsSessionCount);
  }

  async snapshot(): Promise<AdminMetrics> {
    const redis = this.redisService.client;

    const [onlineRaw, activeRaw, sumRaw, countRaw, peakRaw] = await redis.mget(
      RedisKeys.metricsOnlineUsers,
      RedisKeys.metricsActiveRooms,
      RedisKeys.metricsSessionDurationSumSec,
      RedisKeys.metricsSessionCount,
      RedisKeys.metricsPeakOnlineUsers
    );

    const online = Number(onlineRaw ?? "0");
    const active = Number(activeRaw ?? "0");
    const durationSum = Number(sumRaw ?? "0");
    const sessionCount = Number(countRaw ?? "0");
    const peak = Number(peakRaw ?? "0");

    return {
      onlineUsers: online,
      activeRooms: active,
      avgSessionDurationSec: sessionCount > 0 ? durationSum / sessionCount : 0,
      peakOnlineUsers: peak,
      at: Date.now()
    };
  }
}
