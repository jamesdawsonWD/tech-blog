import { getVisiblePosts } from "@/lib/articles";
import HomeContent from "@/components/home-content";
import GalleryPreloader from "@/components/gallery-preloader";

export default async function Home() {
  const posts = await getVisiblePosts();

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HomeContent posts={posts} />
      </main>
      <GalleryPreloader />
    </div>
  );
}
