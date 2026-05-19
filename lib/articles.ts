import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { withContentHash } from "./asset-hash"
import { coverVariantFor } from "@/scripts/lib/asset-pipeline"

const postsDirectory = path.join(process.cwd(), "articles")

function hashAuthor(author: Author | undefined): Author | undefined {
  if (!author) return author
  return { ...author, avatar: withContentHash(author.avatar) ?? author.avatar }
}

export interface Author {
  name: string
  avatar: string
}

export interface Post {
  slug: string
  title: string
  description: string
  date: string
  content: string
  author: Author
  coverImage?: string
  videoImage?: string
  videoPoster?: string
  coverComponent?: string
  showcase?: boolean
  draft?: boolean
  tags: string[]
  components: string[]
}

function posterFor(videoImage: string | undefined): string | undefined {
  if (!videoImage || !videoImage.endsWith(".mp4")) return undefined
  const posterPath = videoImage.replace(/\.mp4$/, ".poster.jpg")
  return withContentHash(posterPath)
}

// Prefer the prebuilt static .cover.jpg variant (no cold optimizer) when it
// exists on disk; fall back to the raw source otherwise.
function coverFor(coverImage: string | undefined): string | undefined {
  if (!coverImage || !coverImage.startsWith("/")) {
    return withContentHash(coverImage)
  }
  const variant = coverVariantFor(coverImage)
  if (fs.existsSync(path.join(process.cwd(), "public", variant))) {
    return withContentHash(variant)
  }
  return withContentHash(coverImage)
}

// Drafts are committed but hidden: visible in dev (shown faded / reachable),
// omitted entirely in prod (filtered out + not statically built / 404).
export function shouldShowDrafts(): boolean {
  return process.env.NODE_ENV !== "production"
}

export type PostMeta = Omit<Post, "content">

export async function getVisiblePosts(): Promise<PostMeta[]> {
  const allPosts = await getAllPosts()
  return shouldShowDrafts() ? allPosts : allPosts.filter((post) => !post.draft)
}

export async function getAllPosts(): Promise<PostMeta[]> {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)

  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, "")
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, "utf8")
    const { data } = matter(fileContents)

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: hashAuthor(data.author),
      coverImage: coverFor(data.coverImage),
      videoImage: withContentHash(data.videoImage),
      videoPoster: posterFor(data.videoImage),
      coverComponent: data.coverComponent,
      showcase: data.showcase || false,
      draft: data.draft || false,
      tags: data.tags || [],
      components: data.components || []
    }
  })

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`)
  if (!fs.existsSync(fullPath)) return null

  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)

  return {
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    content,
    author: hashAuthor(data.author),
    coverImage: coverFor(data.coverImage),
    videoImage: withContentHash(data.videoImage),
    videoPoster: posterFor(data.videoImage),
    coverComponent: data.coverComponent,
    showcase: data.showcase || false,
    draft: data.draft || false,
    tags: data.tags || [],
    components: data.components || []
  }
}
