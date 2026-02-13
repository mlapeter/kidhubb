// Simple in-memory rate limiter. Good enough for single-instance deployments
// (Vercel reuses instances for bursts from the same source). For high-scale,
// swap to Redis/Upstash.

const hits = new Map<string, number[]>();

export function rateLimit(
  ip: string,
  { maxRequests = 20, windowMs = 60_000 } = {}
): boolean {
  const now = Date.now();
  const timestamps = (hits.get(ip) || []).filter((t) => t > now - windowMs);

  if (timestamps.length >= maxRequests) {
    hits.set(ip, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(ip, timestamps);
  return true;
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
