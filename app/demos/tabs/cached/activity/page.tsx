import { ActivityContent } from "../../_shared/activity-content";

// Statically cached segment — see overview/page.tsx for the why.
export const dynamic = "force-static";

export default function Page() {
  return <ActivityContent />;
}
