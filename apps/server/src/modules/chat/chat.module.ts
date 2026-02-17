import { Module } from "@nestjs/common";
import { RedisService } from "../../redis/redis.service";
import { MetricsService } from "../../services/metrics.service";
import { ChatEventsService } from "./chat-events.service";
import { ChatGateway } from "./chat.gateway";
import { QueueService } from "./queue.service";
import { RoomService } from "./room.service";
import { RelayService } from "./relay.service";
import { AliasService } from "./alias.service";
import { RateLimitService } from "./rate-limit.service";
import { MatchQueueService } from "../worker/match-queue.service";

@Module({
    providers: [
        RedisService,
        MetricsService,
        ChatEventsService,
        QueueService,
        RoomService,
        RelayService,
        AliasService,
        RateLimitService,
        MatchQueueService,
        ChatGateway,
    ],
    exports: [ChatEventsService, QueueService, RoomService, AliasService, MatchQueueService],
})
export class ChatModule { }
