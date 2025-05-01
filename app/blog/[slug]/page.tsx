import { notFound } from "next/navigation";
import Image from "next/image";
import { getAllPosts, getPostBySlug } from "@/lib/articles";
import { formatDate } from "@/lib/utils";
import { LikeButton } from "@/components/like-button";
import { CommentSection } from "@/components/comment-section";
import { MDXContent } from "@/components/mdx-content";
import { createServerSupabaseClient } from "@/lib/supabase";
import HeroImage from "@/components/hero-image";
import { EyeIcon, HeartIcon, MessageCircle } from "lucide-react";
import { Suspense } from "react";

export async function generateStaticParams() {
  const posts = await getAllPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | DevBlog`,
    description: post.description,
  };
}

async function getPostData(slug: string) {
  const post = await getPostBySlug(slug);
  if (!post) return null;

  try {
    const supabase = createServerSupabaseClient();

    const [{ data: viewsData }, { count: likes }, { count: comments }] =
      await Promise.all([
        supabase.from("posts").select("views").eq("slug", slug).single(),
        supabase
          .from("likes")
          .select("id", { count: "exact", head: true })
          .eq("post_slug", slug),
        supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .eq("post_slug", slug),
      ]);

    if (viewsData) {
      post.views = viewsData?.views || 0;
      post.likes = likes || 0;
      post.comments = comments || 0;
    }

    // Fire-and-forget
    incrementViewCount(slug, supabase);

    return post;
  } catch (error) {
    console.error("Error fetching post data from Supabase:", error);
    return post;
  }
}

async function incrementViewCount(
  slug: string,
  supabase: ReturnType<typeof createServerSupabaseClient>
) {
  try {
    // Read current view count
    const { data, error: fetchError } = await supabase
      .from("posts")
      .select("views")
      .eq("slug", slug)
      .single();

    if (fetchError || !data) throw fetchError;

    // Increment by 1
    const newViews = (data.views || 0) + 1;

    // Write back the new view count
    const { error: updateError } = await supabase
      .from("posts")
      .update({ views: newViews })
      .eq("slug", slug);

    if (updateError) throw updateError;
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPostData(params.slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-background">
      <main className="container py-6 md:py-12">
        <article className="prose prose-stone dark:prose-invert mx-auto max-w-3xl">
          {post.coverImage && (
            <HeroImage
              src={post.coverImage}
              alt={post.title}
              layoutId={`hero-${post.slug}`}
            />
          )}

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {post.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Image
                  src={post.author.avatar || "/placeholder.svg"}
                  alt={post.author.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <span>{post.author.name}</span>
              </div>
              <span>•</span>
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
          </div>

          <div className="mb-8 flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-eye"
                >
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>{post.views} views</span>
              </div>
              <div className="flex items-center gap-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-message-square"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span>{post.comments} comments</span>
              </div>
            </div>
            <LikeButton postId={post.slug} initialLikes={post.likes} />
          </div>

          <MDXContent content={post.content} />
        </article>

        <div className="mx-auto max-w-3xl mt-12 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Comments</h2>

          <Suspense
            fallback={
              <p className="text-muted-foreground">Loading comments…</p>
            }
          >
            <CommentSection
              postId={post.slug}
              comments={post.commentData || []}
            />
          </Suspense>
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

function Stat({ icon, value }: { icon: string; value: number }) {
  const icons = {
    eye: <EyeIcon width="16" height="16" />,
    heart: <HeartIcon width="16" height="16" />,
    "message-square": <MessageCircle width="16" height="16" />,
  };

  return (
    <div className="flex items-center gap-1">
      {icons[icon as keyof typeof icons]}
      <span>{value}</span>
    </div>
  );
}
