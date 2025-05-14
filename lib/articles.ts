// lib/articles.ts
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { serialize } from "next-mdx-remote/serialize"
import { MDXRemoteSerializeResult } from "next-mdx-remote"

const postsDirectory = path.join(process.cwd(), "articles")

export interface Author {
  name: string
  avatar: string
}

export interface Comment {
  id: string
  author: Author
  content: string
  createdAt: string
}

export interface Post {
  slug: string
  title: string
  description: string
  date: string
  content: string
  author: Author
  coverImage?: string
  views: number
  likes: number
  comments: number
  tags: string[]
  commentData?: Comment[]
  components: string[]
}

export interface PostMeta
  extends Omit<Post, "content" | "commentData"> { }

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
      author: data.author,
      coverImage: data.coverImage,
      views: data.views || 0,
      likes: data.likes || 0,
      comments: data.comments || 0,
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
    author: data.author,
    coverImage: data.coverImage,
    views: data.views || 0,
    likes: data.likes || 0,
    comments: data.comments || 0,
    tags: data.tags || [],
    commentData: data.commentData || [],
    components: data.components || []
  }
}
