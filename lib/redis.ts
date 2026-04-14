import { Redis } from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | null | undefined;
};

function createRedisClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn("REDIS_URL not set; caching and rate limiting will be skipped.");
    return null;
  }

  try {
    new URL(url);
  } catch {
    console.warn("REDIS_URL is invalid; caching and rate limiting will be skipped.");
    return null;
  }

  const client = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  client.on("error", (err) => {
    console.error("[Redis] Connection error:", err.message);
  });

  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// ============================
// Rate Limiting Helper
// ============================
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ success: boolean; remaining: number }> {
  if (!redis) return { success: true, remaining: limit };

  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }
    const remaining = Math.max(0, limit - current);
    return { success: current <= limit, remaining };
  } catch (error) {
    console.error("[Redis] Rate limit failed, allowing request:", error);
    return { success: true, remaining: limit };
  }
}
