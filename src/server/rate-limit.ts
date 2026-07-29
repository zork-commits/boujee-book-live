import { getRequestIP } from "@tanstack/react-start/server";

/**
 * In-memory sliding-window rate limiter. Per-process, which is fine for a
 * single-node deploy; swap for a KV/Redis-backed limiter when scaling out.
 */
const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hits] of buckets) {
    const alive = hits.filter((t) => now - t < 15 * 60_000);
    if (alive.length === 0) buckets.delete(key);
    else buckets.set(key, alive);
  }
}

/** Returns true when the call is allowed; false when the caller should back off. */
export function allow(bucket: string, key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);
  const id = `${bucket}:${key}`;
  const hits = (buckets.get(id) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(id, hits);
    return false;
  }
  hits.push(now);
  buckets.set(id, hits);
  return true;
}

export function clientIp(): string {
  try {
    return getRequestIP({ xForwardedFor: true }) ?? "unknown";
  } catch {
    return "unknown";
  }
}

export const RATE_LIMITED_ERROR = "Too many attempts — wait a minute and try again.";
