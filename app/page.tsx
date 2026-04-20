import { getAllPosts } from "@/lib/articles";
import HomeContent from "@/components/home-content";

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HomeContent posts={posts} />
      </main>
    </div>
  );
}
