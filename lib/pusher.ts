import Pusher from "pusher";

let _pusherServer: Pusher | null = null;

export function getPusherServer(): Pusher {
  if (_pusherServer) return _pusherServer;

  const appId = process.env.PUSHER_APP_ID;
  const key = process.env.PUSHER_KEY;
  const secret = process.env.PUSHER_SECRET;
  const cluster = process.env.PUSHER_CLUSTER;

  if (!appId || !key || !secret || !cluster) {
    throw new Error("Pusher environment variables are not set");
  }

  _pusherServer = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
  });

  return _pusherServer;
}

/** Lazy proxy — safe to import at build time */
export const pusherServer = new Proxy({} as Pusher, {
  get(_target, prop) {
    const p = getPusherServer();
    const value = (p as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(p);
    }
    return value;
  },
});

export function getThreadChannelName(threadId: string) {
  return `private-thread-${threadId}`;
}
