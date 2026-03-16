"use client";

import { useState } from "react";
import Image from "next/image";

export default function CoverImageWithSkeleton({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative w-full h-[300px] md:h-[450px] lg:h-[560px] mb-12 rounded-xl overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-[#F0F4EF]" />
      )}

      <Image
        src={src}
        alt={alt}
        fill
        priority
        className={`object-cover transition-opacity duration-500 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoadingComplete={() => setIsLoaded(true)}
      />
    </div>
  );
}