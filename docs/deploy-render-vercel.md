# Deploy Guide: Vercel + Render + Upstash Redis

## Target Architecture

- Frontend: Vercel (`/Users/mac/Desktop/anon_cb/apps/web`)
- Realtime Backend: Render Web Service (`/Users/mac/Desktop/anon_cb/apps/server`)
- In-memory state: Upstash Redis (managed Redis)

## 1. Create Redis (Upstash)

1. Create a Redis database in Upstash.
2. Copy the Redis connection string (`REDIS_URL`).

## 2. Deploy Backend to Render

Create a **Web Service** pointing to this repository.

- Root directory: repository root
- Build command:

```bash
npm install && npm run build --workspace @anon/server
```

- Start command:

```bash
npm run start --workspace @anon/server
```

Set environment variables in Render:

- `REDIS_URL` = Upstash Redis URL
- `ADMIN_TOKEN` = random strong token for admin dashboard
- `PORT` = provided by Render (Render injects this automatically)
- Optional:
  - `MAX_MESSAGE_LENGTH` (default `500`)
  - `MAX_IMAGE_BYTES` (default `1000000`)
  - `IDLE_TIMEOUT_SEC` (default `60`)
  - `MAX_SESSION_SEC` (default `900`)

After deploy, note backend URL:

- `https://<your-render-service>.onrender.com`

## 3. Deploy Frontend to Vercel

Create a Vercel project for this repository.

- Framework: Next.js
- Root directory: `/Users/mac/Desktop/anon_cb/apps/web`

Set environment variable in Vercel:

- `NEXT_PUBLIC_WS_URL` = backend URL from Render, example:
  - `https://<your-render-service>.onrender.com`

Redeploy Vercel after env var is set.

## 4. Smoke Test

1. Open Vercel URL in two browser tabs.
2. Click `Random Match` in both tabs.
3. Verify text and image relay works.
4. Open admin panel in UI and subscribe with `ADMIN_TOKEN`.
5. Confirm metrics update (online users, active rooms, avg session duration, peak).

## 5. Notes

- Backend uses WebSocket transport via Socket.IO.
- Chat/image payloads are not persisted to database.
- Redis stores queue, room state, and ephemeral metrics only.
