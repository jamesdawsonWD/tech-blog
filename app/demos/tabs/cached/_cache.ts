const cache = new Map<string, true>();

export async function cachedSleep(key: string, delay: number) {
  if (cache.has(key)) return;
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  cache.set(key, true);
}

export function cacheKey(
  tab: string,
  sp: Record<string, string | string[] | undefined>
) {
  const t = Array.isArray(sp.t) ? sp.t[0] : sp.t ?? "0";
  const d = Array.isArray(sp.delay) ? sp.delay[0] : sp.delay ?? "400";
  return `${t}/${tab}/${d}`;
}

export function parseDelay(sp: Record<string, string | string[] | undefined>) {
  const raw = Array.isArray(sp.delay) ? sp.delay[0] : sp.delay;
  const n = raw ? Number(raw) : 400;
  if (!Number.isFinite(n)) return 400;
  return Math.max(0, Math.min(5000, n));
}
