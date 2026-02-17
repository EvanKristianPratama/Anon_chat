import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import { bullConnection } from "../../config/bullmq-connection";

@Injectable()
export class MatchQueueService implements OnModuleDestroy {
  private readonly matchQueue = new Queue("matchmaking", {
    connection: bullConnection,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 100
    }
  });

  private readonly cleanupQueue = new Queue("cleanup", {
    connection: bullConnection,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 100
    }
  });

  async enqueueMatchAttempt(): Promise<void> {
    await this.matchQueue.add("attempt", {});
  }

  async ensureCleanupSchedule(): Promise<void> {
    await this.cleanupQueue.add(
      "sweep",
      {},
      {
        jobId: "cleanup:sweep",
        repeat: {
          every: 15_000
        }
      }
    );
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([this.matchQueue.close(), this.cleanupQueue.close()]);
  }
}
