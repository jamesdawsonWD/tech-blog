import { Suspense } from "react";
import { getAllPosts } from "@/lib/articles";
import HomeContent from "@/components/home-content";

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="xl:h-screen bg-background xl:overflow-hidden h-full overflow-y-auto">
      <main className="h-full">
        <Suspense fallback={null}>
          <HomeContent posts={posts} />
        </Suspense>
      </main>
    </div>
  );
}
