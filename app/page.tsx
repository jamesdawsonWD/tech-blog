import { Suspense } from "react";
import { getAllPosts } from "@/lib/articles";
import HomeContent from "@/components/home-content";

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-background">
      <main>
        <Suspense fallback={null}>
          <HomeContent posts={posts} />
        </Suspense>
      </main>
    </div>
  );
}
