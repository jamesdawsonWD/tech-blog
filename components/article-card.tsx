import Link from "next/link";

export default function ArticleCard({ post }: { post: any }) {
  return (
    <Link
      href={`/articles/${post.slug}`}
      className="group block hover:bg-[#dcdfd6]/30 rounded-lg p-4"
    >
      <h2 className="text-base font-bold text-foreground transition-colors">
        {post.title}
      </h2>
      <p className="mt-1 text-base text-muted-foreground leading-relaxed line-clamp-2">
        {post.description}
      </p>
    </Link>
  );
}
