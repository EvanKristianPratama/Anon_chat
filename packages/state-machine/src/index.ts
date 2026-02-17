export type SessionState = "idle" | "waiting" | "matched" | "ended";

export type SessionEvent =
  | "join_queue"
  | "matched"
  | "skip"
  | "partner_left"
  | "disconnect"
  | "idle_timeout"
  | "max_duration"
  | "requeue";

const transitions: Record<SessionState, Partial<Record<SessionEvent, SessionState>>> = {
  idle: {
    join_queue: "waiting",
    disconnect: "ended"
  },
  waiting: {
    matched: "matched",
    disconnect: "ended"
  },
  matched: {
    skip: "waiting",
    partner_left: "waiting",
    disconnect: "ended",
    idle_timeout: "ended",
    max_duration: "ended"
  },
  ended: {
    requeue: "waiting"
  }
};

export function reduceSessionState(current: SessionState, event: SessionEvent): SessionState {
  return transitions[current][event] ?? current;
}
