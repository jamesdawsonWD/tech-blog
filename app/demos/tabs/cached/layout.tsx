import { TabNav } from "../_shared/tab-nav";
import { LcpBadge } from "../_shared/lcp-badge";

export default function CachedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-4">
      <LcpBadge />
      <div className="mb-4">
        <TabNav basePath="/demos/tabs/cached" />
      </div>
      <div className="rounded-xl border border-zinc-200 bg-white p-4">{children}</div>
    </div>
  );
}
