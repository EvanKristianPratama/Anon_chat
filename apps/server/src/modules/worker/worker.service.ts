import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Worker } from "bullmq";
import { bullConnection } from "../../config/bullmq-connection";
import type { QueueEntry } from "../../domain/chat.types";
import { ChatEventsService } from "../chat/chat-events.service";
import { QueueService } from "../chat/queue.service";
import { RoomService } from "../chat/room.service";
import { AliasService } from "../chat/alias.service";
import { MatchQueueService } from "./match-queue.service";

@Injectable()
export class WorkerService implements OnModuleInit, OnModuleDestroy {
  private matchmakingWorker?: Worker;
  private cleanupWorker?: Worker;

  constructor(
    private readonly matchQueueService: MatchQueueService,
    private readonly queue: QueueService,
    private readonly rooms: RoomService,
    private readonly aliases: AliasService,
    private readonly events: ChatEventsService,
  ) { }

  async onModuleInit(): Promise<void> {
    await this.matchQueueService.ensureCleanupSchedule();

    this.matchmakingWorker = new Worker(
      "matchmaking",
      async () => {
        await this.processMatch();
      },
      { connection: bullConnection, concurrency: 20 },
    );

    this.cleanupWorker = new Worker(
      "cleanup",
      async () => {
        await this.rooms.sweepExpired();
      },
      { connection: bullConnection, concurrency: 1 },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([this.matchmakingWorker?.close(), this.cleanupWorker?.close()]);
  }

  private async processMatch(): Promise<void> {
    const pair = await this.queue.dequeuePair();
    if (!pair) return;

    const [first, second] = pair;

    const firstOnline = this.events.isSocketConnected(first.socketId);
    const secondOnline = this.events.isSocketConnected(second.socketId);

    if (!firstOnline && !secondOnline) return;

    if (!firstOnline && secondOnline) {
      await this.requeue(second);
      return;
    }

    if (firstOnline && !secondOnline) {
      await this.requeue(first);
      return;
    }

    const room = await this.rooms.create(first, second);

    // Resolve aliases for each partner
    const firstAlias = await this.aliases.get(first.userId);
    const secondAlias = await this.aliases.get(second.userId);

    this.events.emitToSocket(first.socketId, "room:matched", {
      roomId: room.roomId,
      partnerId: second.userId,
      partnerAlias: secondAlias ?? undefined,
    });

    this.events.emitToSocket(second.socketId, "room:matched", {
      roomId: room.roomId,
      partnerId: first.userId,
      partnerAlias: firstAlias ?? undefined,
    });
  }

  private async requeue(entry: QueueEntry): Promise<void> {
    const queued = await this.queue.enqueue({
      userId: entry.userId,
      socketId: entry.socketId,
      enqueuedAt: Date.now(),
    });

    if (queued) {
      await this.matchQueueService.enqueueMatchAttempt();
    }
  }
}
