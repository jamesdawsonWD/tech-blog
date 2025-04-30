import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "@/components/theme-toggle"
import { getAllPosts } from "@/lib/mdx"
import { formatDate } from "@/lib/utils"
import { createServerSupabaseClient } from "@/lib/supabase"

export default async function Home() {
  const posts = await getAllPosts()
  const supabase = createServerSupabaseClient()

  // Get post stats from Supabase
  const { data: postStats } = await supabase.from("posts").select("slug, views")

  // Get likes counts
  const likesPromises = posts.map((post) =>
    supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_slug", post.slug),
  )

  const likesResults = await Promise.all(likesPromises)

  // Get comments counts
  const commentsPromises = posts.map((post) =>
    supabase.from("comments").select("id", { count: "exact", head: true }).eq("post_slug", post.slug),
  )

  const commentsResults = await Promise.all(commentsPromises)

  // Merge data
  const postsWithStats = posts.map((post, index) => {
    const postStat = postStats?.find((stat) => stat.slug === post.slug)

    return {
      ...post,
      views: postStat?.views || post.views,
      likes: likesResults[index].count || 0,
      comments: commentsResults[index].count || 0,
    }
  })

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
        <div className="flex flex-col items-start gap-4 md:gap-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl">Welcome to DevBlog</h1>
            <p className="text-muted-foreground md:text-xl">A blog about web development, programming, and tech.</p>
          </div>

          <section className="w-full py-12 md:py-24 lg:py-32">
            <div className="space-y-12">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">Latest Posts</h2>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {postsWithStats.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group rounded-lg border p-6 shadow-md transition-all hover:shadow-lg"
                  >
                    {post.coverImage && (
                      <div className="mb-4 overflow-hidden rounded-lg">
                        <Image
                          src={post.coverImage || "/placeholder.svg"}
                          alt={post.title}
                          width={600}
                          height={340}
                          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Image
                        src={post.author.avatar || "/placeholder.svg"}
                        alt={post.author.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      <span>{post.author.name}</span>
                      <span>•</span>
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <h3 className="text-xl font-bold group-hover:underline">{post.title}</h3>
                    <p className="mt-2 text-muted-foreground">{post.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
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
                        <span>{post.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-heart"
                        >
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
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
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </Link>
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
  )
}
