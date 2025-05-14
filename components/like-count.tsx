import { createServerSupabaseClient } from "@/lib/supabase";

export default async function LikeCount({ slug }: { slug: string }) {
  const supabase = createServerSupabaseClient();

  const { count } = await supabase
    .from("likes")
    .select("id", { count: "exact", head: true })
    .eq("post_slug", slug);

  return (
    <span className="text-sm text-muted-foreground">
      {count?.toLocaleString() ?? 0} likes
    </span>
  );
}
