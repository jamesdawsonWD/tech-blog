import { SettingsContent } from "../../_shared/settings-content";
import { cachedSleep, cacheKey, parseDelay } from "../_cache";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  await cachedSleep(cacheKey("settings", sp), parseDelay(sp));
  return <SettingsContent />;
}
