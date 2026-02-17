import { Module } from "@nestjs/common";
import { ChatModule } from "../chat/chat.module";
import { WorkerService } from "./worker.service";

@Module({
    imports: [ChatModule],
    providers: [WorkerService],
})
export class WorkerModule { }
