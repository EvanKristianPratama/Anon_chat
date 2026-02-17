import { Injectable } from "@nestjs/common";
import { RedisKeys } from "../../constants/redis-keys";
import { RedisService } from "../../redis/redis.service";

@Injectable()
export class RateLimitService {
  constructor(private readonly redisService: RedisService) {}

  async allow(ip: string, action: string, limit: number, windowSec: number): Promise<boolean> {
    const bucket = Math.floor(Date.now() / 1000 / windowSec);
    const key = RedisKeys.rateLimit(ip, action, bucket);
    const redis = this.redisService.client;

    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSec + 1);
    }

    return count <= limit;
  }
}
