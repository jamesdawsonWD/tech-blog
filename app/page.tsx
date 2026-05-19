import { getAllPosts } from "@/lib/articles";
import HomeContent from "@/components/home-content";

// Drafts are committed but hidden: shown faded in dev, omitted entirely in prod.
const showDrafts = process.env.NODE_ENV !== "production";

export default async function Home() {
  const allPosts = await getAllPosts();
  const posts = showDrafts
    ? allPosts
    : allPosts.filter((post) => !post.draft);

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HomeContent posts={posts} />
      </main>
    </div>
  );
}
