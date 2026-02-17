interface RateBucket {
  count: number;
  expiresAt: number;
}

export class InMemoryRateLimiter {
  private readonly buckets = new Map<string, RateBucket>();

  allow(ip: string, action: string, limit: number, windowSec: number): boolean {
    const now = Date.now();
    const bucket = Math.floor(now / (windowSec * 1000));
    const key = `${ip}:${action}:${bucket}`;

    const current = this.buckets.get(key);
    if (!current) {
      this.buckets.set(key, {
        count: 1,
        expiresAt: now + windowSec * 1000 + 1000
      });
      this.gc(now);
      return true;
    }

    current.count += 1;
    this.gc(now);
    return current.count <= limit;
  }

  private gc(now: number): void {
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.expiresAt <= now) {
        this.buckets.delete(key);
      }
    }
  }
}
