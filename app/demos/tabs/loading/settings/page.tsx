import { SettingsContent } from "../../_shared/settings-content";
import { sleep } from "../../_shared/sleep";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  await sleep(sp);
  return <SettingsContent />;
}
