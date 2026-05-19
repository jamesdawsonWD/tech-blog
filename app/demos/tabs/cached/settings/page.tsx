import { SettingsContent } from "../../_shared/settings-content";

// Settings is the hybrid case. It shows account-specific, personal data,
// so it cannot be statically cached the way overview/activity are — it has
// to render per request. <Link>'s default prefetch can only warm this route
// up to its loading.tsx boundary (the skeleton), not the data. So this tab
// keeps a skeleton on click while the per-request data is fetched.
export const dynamic = "force-dynamic";

// Stands in for fetching the user's account data on every request.
const PERSONAL_DATA_MS = 600;

export default async function Page() {
  await new Promise((r) => setTimeout(r, PERSONAL_DATA_MS));
  return <SettingsContent />;
}
