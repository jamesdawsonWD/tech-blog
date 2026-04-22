import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { withContentHash } from "./asset-hash"

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
  showcase?: boolean
  tags: string[]
  components: string[]
}

export type PostMeta = Omit<Post, "content">

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
      coverImage: withContentHash(data.coverImage),
      videoImage: withContentHash(data.videoImage),
      showcase: data.showcase || false,
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
    coverImage: withContentHash(data.coverImage),
    videoImage: withContentHash(data.videoImage),
    showcase: data.showcase || false,
    tags: data.tags || [],
    components: data.components || []
  }
}
