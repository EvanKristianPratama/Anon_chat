# Redis Schema (No Chat Persistence)

## Queue

- `queue:waiting` (LIST)
  - Value: JSON `{"userId","socketId","enqueuedAt"}`
  - Policy: transient; consumed by matchmaking worker
- `queue:members` (SET)
  - Value: `userId`
  - Purpose: dedupe queue membership

## Rooms

- `room:{roomId}` (HASH, TTL)
  - Fields: `userA`, `userB`, `socketA`, `socketB`, `startedAt`, `lastActivityAt`, `status`
  - TTL: `MAX_SESSION_SEC + 120`
- `user:{userId}:room` (STRING, TTL)
  - Value: `roomId`
  - TTL: same as room
- `rooms:active` (SET)
  - Value: `roomId`
  - Purpose: cleanup sweep source
- `lock:room:{roomId}` (STRING, short TTL)
  - Purpose: idempotent room teardown

## Rate Limit

- `ratelimit:{ip}:{action}:{bucket}` (STRING, short TTL)
  - Value: increment counter
  - TTL: action window + 1 sec

## Metrics

- `metrics:online_users` (STRING integer)
- `metrics:peak_online_users` (STRING integer)
- `metrics:active_rooms` (STRING integer)
- `metrics:session_duration_sum_sec` (STRING float)
- `metrics:session_count` (STRING integer)

## Storage Policy

- Text chat: never stored in Redis or database.
- Image payload: only in process memory while being relayed to partner.
- Disk writes: none for chat/image events.
