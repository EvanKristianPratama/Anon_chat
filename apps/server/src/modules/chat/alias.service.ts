import { Injectable } from "@nestjs/common";
import { env } from "../../config/env";
import { RedisKeys } from "../../constants/redis-keys";
import { RedisService } from "../../redis/redis.service";
import { sanitize } from "../../common/sanitize.util";

@Injectable()
export class AliasService {
    constructor(private readonly redis: RedisService) { }

    /**
     * Stores a sanitized alias for the given user with a TTL.
     * Returns the normalized alias or null if invalid.
     */
    async save(userId: string, rawAlias: string): Promise<string | null> {
        const alias = sanitize(rawAlias.trim()).slice(0, env.aliasMaxLength);

        if (alias.length < env.aliasMinLength) {
            return null;
        }

        await this.redis.client.set(
            RedisKeys.alias(userId),
            alias,
            "EX",
            env.aliasTtlSec,
        );

        return alias;
    }

    async get(userId: string): Promise<string | null> {
        return this.redis.client.get(RedisKeys.alias(userId));
    }

    async remove(userId: string): Promise<void> {
        await this.redis.client.del(RedisKeys.alias(userId));
    }
}
