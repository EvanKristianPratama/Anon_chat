# Deploy Guide: Vercel + Cloudflare Workers (Durable Objects)

## Target Architecture

- Frontend: Vercel (`/Users/mac/Desktop/anon_cb/apps/web`)
- Realtime backend: Cloudflare Worker + Durable Object (`/Users/mac/Desktop/anon_cb/apps/worker`)
- Redis: not required for worker mode

## 1. Login Cloudflare

```bash
cd /Users/mac/Desktop/anon_cb/apps/worker
npx wrangler login
npx wrangler whoami
```

## 2. Configure Worker Env

Create local file for dev:

```bash
cp .dev.vars.example .dev.vars
```

Set at minimum:

- `ADMIN_TOKEN` = strong random token
- `CORS_ORIGIN` = your frontend domain (for production)

## 3. Deploy Worker

```bash
cd /Users/mac/Desktop/anon_cb/apps/worker
npm run deploy
```

After deploy, copy worker URL:

- `https://<worker-name>.<subdomain>.workers.dev`

WebSocket endpoints:

- User chat: `wss://<worker-url>/ws`
- Admin feed: `wss://<worker-url>/admin/ws`

## 4. Configure Vercel Frontend

Set env in Vercel project (`apps/web`):

- `NEXT_PUBLIC_WS_URL` = `https://<worker-name>.<subdomain>.workers.dev`

Redeploy Vercel after updating env.

## 5. Smoke Test

1. Open frontend in two browser tabs.
2. Submit display name and click next/new chat.
3. Verify both tabs receive `room:matched`.
4. Send text and image both ways.
5. Open `/admin`, input `ADMIN_TOKEN`, verify live metrics update.

## Notes

- Worker mode uses native WebSocket envelopes (`{ event, payload }`), not Socket.IO transport.
- Messages and images are relayed in memory only and are not persisted.
