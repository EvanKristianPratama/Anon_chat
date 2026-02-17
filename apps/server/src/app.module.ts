import { Module } from "@nestjs/common";
import { ChatModule } from "./modules/chat/chat.module";
import { AdminModule } from "./modules/admin/admin.module";
import { WorkerModule } from "./modules/worker/worker.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [ChatModule, AdminModule, WorkerModule, HealthModule],
})
export class AppModule { }
