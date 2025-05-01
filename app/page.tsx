import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";
import { getAllPosts } from "@/lib/articles";
import { formatDate } from "@/lib/utils";
import { createServerSupabaseClient } from "@/lib/supabase";
import { LinkButton } from "@/components/ui/link-button";
import { ArrowRightIcon, MailIcon } from "lucide-react";
import ArticleCard from "@/components/article-card";

export default async function Home() {
  const posts = await getAllPosts();
  const supabase = createServerSupabaseClient();

  // Get post stats from Supabase
  const { data: postStats } = await supabase
    .from("posts")
    .select("slug, views");

  // Get likes counts
  const likesPromises = posts.map((post) =>
    supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("post_slug", post.slug)
  );

  const likesResults = await Promise.all(likesPromises);

  // Get comments counts
  const commentsPromises = posts.map((post) =>
    supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("post_slug", post.slug)
  );

  const commentsResults = await Promise.all(commentsPromises);

  // Merge data
  const postsWithStats = posts.map((post, index) => {
    const postStat = postStats?.find((stat) => stat.slug === post.slug);

    return {
      ...post,
      views: postStat?.views || post.views,
      likes: likesResults[index].count || 0,
      comments: commentsResults[index].count || 0,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 md:py-12 ">
        <div className="flex flex-col items-center  gap-4 md:gap-8">
          <div className="flex flex-col items-center max-w-[900px]">
            <h1 className="relative text-center text-5xl font-bold leading-[1.05] tracking-tight delay-50 sm:text-8xl sm:leading-none text-foreground">
              Modern webdev has{" "}
              <span className="relative inline-block font-extrabold before:content-[''] before:absolute before:inset-x-0 before:-bottom-0 before:h-8 before:w-full before:bg-lime-300 before:-z-10 z-10">
                evolved
              </span>
              .
            </h1>

            <div className="pt-12 flex flex-col items-center justify-center space-y-6 delay-700 sm:mt-12 sm:flex-row sm:space-x-7 sm:space-y-0">
              <LinkButton variant="soft">Pre-order masterclass</LinkButton>
              <LinkButton>
                <div className="ease absolute left-5 translate-x-0 opacity-100 transition duration-300 group-hover:-translate-x-full group-hover:scale-x-50 group-hover:opacity-0 group-hover:blur-sm">
                  <MailIcon className="h-6 w-6 stroke-current text-background" />
                </div>
                <div className="ease translate-x-0 transition duration-300 group-hover:-translate-x-8">
                  Build modern UI every week
                </div>
                <div className="ease absolute right-5 translate-x-full scale-x-50 opacity-0 blur-sm transition duration-300 group-hover:translate-x-0 group-hover:scale-x-100 group-hover:opacity-100 group-hover:blur-none">
                  <ArrowRightIcon className="h-6 w-6 stroke-current text-background" />
                </div>
              </LinkButton>
            </div>
            <p className="mt-12 text-center">
              Be the big brain 🧠 at the morning meeting.
            </p>
          </div>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="space-y-12">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12">
                {postsWithStats.map((post) => (
                  <ArticleCard key={post.slug} post={post} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with Next.js, MDX, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}
