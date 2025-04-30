import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { postId } = await request.json()
    const supabase = createServerSupabaseClient()

    // First, check if the post exists
    const { data: existingPost } = await supabase.from("posts").select("slug, views").eq("slug", postId).single()

    if (existingPost) {
      // Update existing post views
      const { error } = await supabase
        .from("posts")
        .update({ views: existingPost.views + 1 })
        .eq("slug", postId)

      if (error) throw error
    } else {
      // Insert new post record
      const { error } = await supabase.from("posts").insert({ slug: postId, title: postId, views: 1 })

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error incrementing views:", error)
    return NextResponse.json({ error: "Failed to increment views" }, { status: 500 })
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
    const { data, error } = await supabase.from("posts").select("views").eq("slug", postId).single()

    if (error) throw error

    return NextResponse.json({ views: data?.views || 0 })
  } catch (error) {
    console.error("Error fetching views:", error)
    return NextResponse.json({ error: "Failed to fetch views" }, { status: 500 })
  }
}
