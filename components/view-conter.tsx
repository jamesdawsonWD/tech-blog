// components/ViewCount.tsx
import { createServerSupabaseClient } from "@/lib/supabase";

export default async function ViewCount({ slug }: { slug: string }) {
  const supabase = createServerSupabaseClient();

  // Fire-and-forget view increment
  void supabase.rpc("increment_view_count", { slug });

  const { data, error } = await supabase
    .from("posts")
    .select("views")
    .eq("slug", slug)
    .single();

  const views = data?.views ?? 0;

  return (
    <span className="text-sm text-muted-foreground">
      {views.toLocaleString()} views
    </span>
  );
}
