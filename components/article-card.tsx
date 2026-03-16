import Link from "next/link";

export default function ArticleCard({ post }: { post: any }) {
  return (
    <Link
      href={`/articles/${post.slug}`}
      className="group block"
    >
      <h3 className="text-base font-bold text-foreground group-hover:text-muted-foreground transition-colors">
        {post.title}
      </h3>
      <p className="mt-1 text-base text-muted-foreground leading-relaxed line-clamp-2">
        {post.description}
      </p>
    </Link>
  );
}
