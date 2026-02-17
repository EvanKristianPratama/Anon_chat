# Anonymous Chat Blueprint (KISS)

TypeScript full-stack starter for anonymous random chat with no message persistence.

## Stack

- Frontend: Next.js App Router + TypeScript
- Realtime API: NestJS + Socket.IO
- In-memory state: Redis
- Worker: BullMQ
- Infra starter: Docker compose (Redis)
- Edge realtime option: Cloudflare Workers + Durable Objects (no Redis required)

## Implemented Features

- Anonymous users (no login)
- Random matchmaking queue
- Skip (end room and requeue requester)
- Stay (requeue when room already ended)
- Real-time text relay
- Real-time image relay (not persisted)
- Admin live metrics: online users, active rooms, average session duration, peak online
- No DB chat storage

## Project Structure

- `apps/server`: NestJS websocket API + workers
- `apps/worker`: Cloudflare Worker + Durable Object realtime backend
- `apps/web`: Next.js UI for user chat + admin monitor
- `packages/contracts`: shared event contracts
- `packages/state-machine`: shared finite state reducer
- `docs/redis-schema.md`: Redis key model
- `docs/state-machine.md`: lifecycle transitions

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Start Redis

```bash
docker compose up -d
```

3. Configure env

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.local.example apps/web/.env.local
```

4. Run server and web in separate terminals

```bash
npm run dev:server
npm run dev:web
```

## Cloudflare Worker Mode (No Card Friendly)

1. Authenticate wrangler

```bash
cd apps/worker
npx wrangler login
npx wrangler whoami
```

2. Create local worker vars

```bash
cp .dev.vars.example .dev.vars
```

3. Run worker locally and web app

```bash
cd /Users/mac/Desktop/anon_cb/apps/worker && npm run dev
cd /Users/mac/Desktop/anon_cb && npm run dev:web
```

4. Set frontend websocket env

```bash
NEXT_PUBLIC_WS_URL=http://localhost:8787
```

## Security Guardrails Included

- Rate limit by IP (queue/text/image/skip)
- Max message length
- Image type whitelist and max 1MB
- Idle timeout cleanup (60 sec default)
- Max session timeout cleanup (15 min default)
- Idempotent room teardown lock

## Notes

- This starter is intentionally KISS and keeps a single source of truth in Redis.
- If you scale to multi-instance websocket servers, add Socket.IO Redis adapter.
- Deployment runbook for Vercel + Render + Upstash: `/Users/mac/Desktop/anon_cb/docs/deploy-render-vercel.md`.
- Deployment runbook for Vercel + Cloudflare Workers: `/Users/mac/Desktop/anon_cb/docs/deploy-cloudflare-workers-vercel.md`.
# Anon_chat
