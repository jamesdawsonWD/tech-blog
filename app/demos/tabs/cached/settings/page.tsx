import { SettingsContent } from "../../_shared/settings-content";

// Statically cached segment — see overview/page.tsx for the why.
export const dynamic = "force-static";

export default function Page() {
  return <SettingsContent />;
}
