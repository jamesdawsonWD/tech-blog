import { ActivityContent } from "../../_shared/activity-content";
import { cachedSleep, cacheKey, parseDelay } from "../_cache";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  await cachedSleep(cacheKey("activity", sp), parseDelay(sp));
  return <ActivityContent />;
}
