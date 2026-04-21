export async function sleep(searchParams: Record<string, string | string[] | undefined>) {
  const raw = searchParams.delay;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = value ? Number(value) : 400;
  const delay = Number.isFinite(parsed) ? Math.max(0, Math.min(5000, parsed)) : 400;
  if (delay === 0) return;
  await new Promise((r) => setTimeout(r, delay));
}
