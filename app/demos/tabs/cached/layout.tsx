import { TabNav } from "../_shared/tab-nav";
import { LcpBadge } from "../_shared/lcp-badge";

export default function CachedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-4">
      <LcpBadge />
      <div className="mb-4">
        <TabNav basePath="/demos/tabs/cached" prefetch={false} />
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">{children}</div>
    </div>
  );
}
