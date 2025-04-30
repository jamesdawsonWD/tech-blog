import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { postId, userId = "anonymous" } = await request.json()
    const supabase = createServerSupabaseClient()

    // First, ensure the post exists in the posts table
    const { data: existingPost } = await supabase.from("posts").select("slug").eq("slug", postId).single()

    if (!existingPost) {
      // Create the post if it doesn't exist
      const { error: insertError } = await supabase.from("posts").insert({ slug: postId, title: postId, views: 0 })

      if (insertError) throw insertError
    }

    // Check if the user has already liked this post
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("post_slug", postId)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      // User already liked this post, so we'll remove the like (toggle)
      const { error } = await supabase.from("likes").delete().eq("id", existingLike.id)

      if (error) throw error

      return NextResponse.json({ liked: false })
    } else {
      // Add new like
      const { error } = await supabase.from("likes").insert({ post_slug: postId, user_id: userId })

      if (error) throw error

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const postId = url.searchParams.get("postId")
    const userId = url.searchParams.get("userId") || "anonymous"

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Get total likes count
    const { count, error: countError } = await supabase
      .from("likes")
      .select("id", { count: "exact", head: true })
      .eq("post_slug", postId)

    if (countError) throw countError

    // Check if user has liked the post
    const { data, error: likeError } = await supabase
      .from("likes")
      .select("id")
      .eq("post_slug", postId)
      .eq("user_id", userId)
      .single()

    if (likeError && likeError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which is fine
      throw likeError
    }

    return NextResponse.json({
      count: count || 0,
      liked: !!data,
    })
  } catch (error) {
    console.error("Error fetching likes:", error)
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 })
  }
}
