import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: env.corsOrigin
    }
  });
  await app.listen(env.port);

  const logger = new Logger("Bootstrap");
  logger.log(`WebSocket API listening on port ${env.port}`);
}

void bootstrap();
