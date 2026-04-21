import { OverviewContent } from "../../_shared/overview-content";
import { cachedSleep, cacheKey, parseDelay } from "../_cache";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  await cachedSleep(cacheKey("overview", sp), parseDelay(sp));
  return <OverviewContent />;
}
