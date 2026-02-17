import { Module } from "@nestjs/common";
import { RedisService } from "../../redis/redis.service";
import { MetricsService } from "../../services/metrics.service";
import { AdminGateway } from "./admin.gateway";

@Module({
    providers: [RedisService, MetricsService, AdminGateway],
})
export class AdminModule { }
