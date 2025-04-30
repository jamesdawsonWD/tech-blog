"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"

interface LikeButtonProps {
  postId: string
  initialLikes?: number
}

export function LikeButton({ postId, initialLikes = 0 }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Get initial like state and count
  useEffect(() => {
    const fetchLikeData = async () => {
      try {
        const userId = localStorage.getItem("userId") || "anonymous"
        const response = await fetch(`/api/likes?postId=${postId}&userId=${userId}`)

        if (!response.ok) throw new Error("Failed to fetch likes")

        const data = await response.json()
        setLikes(data.count)
        setLiked(data.liked)
        setIsInitialized(true)
      } catch (error) {
        console.error("Error fetching like data:", error)
        setIsInitialized(true)
      }
    }

    fetchLikeData()
  }, [postId])

  const handleLike = async () => {
    if (isLoading || !isInitialized) return

    setIsLoading(true)

    // Optimistic update
    setLiked(!liked)
    setLikes(liked ? likes - 1 : likes + 1)

    try {
      // Ensure we have a userId (even if anonymous)
      let userId = localStorage.getItem("userId")
      if (!userId) {
        userId = `anonymous-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        localStorage.setItem("userId", userId)
      }

      // Call API to update likes
      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, userId }),
      })

      if (!response.ok) throw new Error("Failed to update like")

      const data = await response.json()

      // If the server response doesn't match our optimistic update, revert
      if (data.liked !== !liked) {
        setLiked(data.liked)
        setLikes(data.liked ? likes + 1 : likes - 1)
      }
    } catch (error) {
      // Revert on error
      console.error("Failed to like post:", error)
      setLiked(!liked)
      setLikes(liked ? likes : likes - 1)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={liked ? "default" : "outline"}
      size="sm"
      className={`gap-2 ${liked ? "bg-rose-500 hover:bg-rose-600" : ""}`}
      onClick={handleLike}
      disabled={isLoading || !isInitialized}
    >
      <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
      <span>{likes}</span>
    </Button>
  )
}
