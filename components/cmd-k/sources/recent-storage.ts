const KEY = "tech-blog.cmdk.recent";
const CAP = 6;

export type RecentEntry = {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
  at: number;
};

export function readRecents(): RecentEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordRecent(entry: Omit<RecentEntry, "at">): void {
  if (typeof window === "undefined") return;
  try {
    const current = readRecents().filter((r) => r.id !== entry.id);
    const next: RecentEntry[] = [{ ...entry, at: Date.now() }, ...current].slice(0, CAP);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // quota or private mode — silently drop
  }
}
