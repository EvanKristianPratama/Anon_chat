# Session State Machine

## States

- `idle`: connected but not in queue or room
- `waiting`: in random queue
- `matched`: active room with partner
- `ended`: disconnected or terminated session

## Events

- `join_queue`
- `matched`
- `skip`
- `partner_left`
- `disconnect`
- `idle_timeout`
- `max_duration`
- `requeue`

## Transition Table

- `idle + join_queue -> waiting`
- `waiting + matched -> matched`
- `matched + skip -> waiting`
- `matched + partner_left -> waiting`
- `matched + idle_timeout -> ended`
- `matched + max_duration -> ended`
- `waiting + disconnect -> ended`
- `matched + disconnect -> ended`
- `ended + requeue -> waiting`
