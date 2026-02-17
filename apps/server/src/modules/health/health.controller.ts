import { Controller, Get } from "@nestjs/common";

@Controller("health")
export class HealthController {
  @Get()
  getHealth(): { ok: true; at: number } {
    return {
      ok: true,
      at: Date.now()
    };
  }
}
