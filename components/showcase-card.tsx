"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";

export default function ShowcaseCard({ post }: { post: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const transitionName = `cover-${post.slug}`;

  return (
    <Link
      href={`/articles/${post.slug}`}
      className="group block rounded-lg p-4 hover:bg-[#dcdfd6]/30"
    >
      {post.videoImage && (
        <div
          className="aspect-video w-full overflow-hidden rounded-lg bg-black/5"
          style={{ viewTransitionName: transitionName }}
        >
          <video
            ref={videoRef}
            src={post.videoImage}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <h3 className="mt-3 text-base font-bold text-foreground transition-colors">
        {post.title}
      </h3>
      <p className="mt-1 text-base text-muted-foreground leading-relaxed line-clamp-2">
        {post.description}
      </p>
    </Link>
  );
}
