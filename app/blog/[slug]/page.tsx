import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getAllPosts, getPostBySlug } from "@/lib/mdx"
import { ThemeToggle } from "@/components/theme-toggle"
import { formatDate } from "@/lib/utils"
import { LikeButton } from "@/components/like-button"
import { CommentSection } from "@/components/comment-section"
import { MDXContent } from "@/components/mdx-content"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function generateStaticParams() {
  const posts = await getAllPosts()

  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    return {}
  }

  return {
    title: `${post.title} | DevBlog`,
    description: post.description,
  }
}

async function getPostData(slug: string) {
  const post = await getPostBySlug(slug)

  if (!post) {
    return null
  }

  try {
    // Get post data from Supabase
    const supabase = createServerSupabaseClient()

    // Get views
    const { data: postData } = await supabase.from("posts").select("views").eq("slug", slug).single()

    // Get likes count
    const { count: likesCount } = await supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("post_slug", slug)

    // Get comments count
    const { count: commentsCount } = await supabase
      .from("comments")
      .select("id", { count: "exact", head: true })
      .eq("post_slug", slug)

    // If post exists in Supabase, use those counts
    if (postData) {
      post.views = postData.views
      post.likes = likesCount || 0
      post.comments = commentsCount || 0
    }

    // Increment view count (we'll do this asynchronously)
    incrementViewCount(slug)

    return post
  } catch (error) {
    console.error("Error fetching post data from Supabase:", error)
    return post
  }
}

async function incrementViewCount(slug: string) {
  try {
    // This is fire-and-forget, we don't need to await it
    fetch("/api/views", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId: slug }),
    })
  } catch (error) {
    console.error("Error incrementing view count:", error)
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPostData(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <Link href="/" className="font-bold text-2xl">
            DevBlog
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="container py-6 md:py-12">
        <article className="prose prose-stone dark:prose-invert mx-auto max-w-3xl">
          {post.coverImage && (
            <div className="mb-8 overflow-hidden rounded-lg">
              <Image
                src={post.coverImage || "/placeholder.svg"}
                alt={post.title}
                width={1200}
                height={630}
                className="w-full object-cover"
              />
            </div>
          )}

          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
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
          <CommentSection postId={post.slug} comments={post.commentData || []} />
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
  )
}
