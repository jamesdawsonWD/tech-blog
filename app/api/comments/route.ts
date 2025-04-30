import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Mock user for comments (in a real app, this would come from authentication)
const currentUser = {
  id: "anonymous",
  name: "Current User",
  avatar: "/placeholder.svg?height=40&width=40",
}

export async function POST(request: Request) {
  try {
    const { postId, content } = await request.json()
    const supabase = createServerSupabaseClient()

    // First, ensure the post exists in the posts table
    const { data: existingPost } = await supabase.from("posts").select("slug").eq("slug", postId).single()

    if (!existingPost) {
      // Create the post if it doesn't exist
      const { error: insertError } = await supabase.from("posts").insert({ slug: postId, title: postId, views: 0 })

      if (insertError) throw insertError
    }

    // Insert the comment
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_slug: postId,
        user_id: currentUser.id,
        author_name: currentUser.name,
        author_avatar: currentUser.avatar,
        content,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({
      id: data.id,
      author: {
        name: data.author_name,
        avatar: data.author_avatar,
      },
      content: data.content,
      createdAt: data.created_at,
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const postId = url.searchParams.get("postId")

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_slug", postId)
      .order("created_at", { ascending: false })

    if (error) throw error

    const formattedComments = data.map((comment) => ({
      id: comment.id,
      author: {
        name: comment.author_name,
        avatar: comment.author_avatar,
      },
      content: comment.content,
      createdAt: comment.created_at,
    }))

    return NextResponse.json(formattedComments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}
