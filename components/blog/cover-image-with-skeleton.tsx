"use client";

import { useState } from "react";
import Image from "next/image";

export default function CoverImageWithSkeleton({
  src,
  videoSrc,
  videoPoster,
  alt,
  slug,
}: {
  src?: string;
  videoSrc?: string;
  videoPoster?: string;
  alt: string;
  slug?: string;
}) {
  const [hasVideoError, setHasVideoError] = useState(false);
  const shouldShowVideo = Boolean(videoSrc) && !hasVideoError;
  const posterSrc = videoPoster ?? src;

  return (
    <div
      className="relative w-full h-[300px] md:h-[450px] lg:h-[560px] mb-12 rounded-xl overflow-hidden bg-muted"
      style={slug ? { viewTransitionName: `cover-${slug}` } : undefined}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          priority
          unoptimized
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="z-0 object-cover"
        />
      )}

      {posterSrc && !src && (
        <Image
          src={posterSrc}
          alt={alt}
          fill
          priority
          unoptimized
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="z-0 object-cover"
        />
      )}

      {shouldShowVideo && (
        <video
          src={videoSrc}
          poster={posterSrc}
          preload="auto"
          fetchPriority="high"
          className="absolute inset-0 z-10 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          onError={() => setHasVideoError(true)}
        />
      )}
    </div>
  );
}
