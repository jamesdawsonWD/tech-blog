import { OverviewContent } from "../../_shared/overview-content";

// The data here is stable, so the whole segment is statically cached.
// Because it is cacheable, a visible <Link>'s default prefetch warms the
// fully rendered content — not just the loading.tsx skeleton — so tab
// navigation lands on real content instantly.
export const dynamic = "force-static";

export default function Page() {
  return <OverviewContent />;
}
