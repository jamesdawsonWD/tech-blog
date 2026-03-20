"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function CoverImageWithSkeleton({
  src,
  videoSrc,
  alt,
}: {
  src?: string;
  videoSrc?: string;
  alt: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  const shouldShowVideo = Boolean(videoSrc) && !hasVideoError;
  const isLoaded = shouldShowVideo ? isVideoLoaded : isImageLoaded;

  // `loadeddata` / `canplay` can fire before React attaches `on*` props (e.g. cached MP4),
  // which leaves the video stuck at opacity-0 forever.
  useEffect(() => {
    if (!shouldShowVideo) return;

    const el = videoRef.current;
    if (!el) return;

    const markReady = () => setIsVideoLoaded(true);

    if (el.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markReady();
    }

    el.addEventListener("loadeddata", markReady);
    el.addEventListener("canplay", markReady);
    el.addEventListener("playing", markReady);

    void el.play().catch(() => {
      // Autoplay can still be blocked in edge cases; `playing` will flip us visible if it starts.
    });

    return () => {
      el.removeEventListener("loadeddata", markReady);
      el.removeEventListener("canplay", markReady);
      el.removeEventListener("playing", markReady);
    };
  }, [shouldShowVideo, videoSrc]);

  return (
    <div className="relative w-full h-[300px] md:h-[450px] lg:h-[560px] mb-12 rounded-xl overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 z-20 animate-pulse bg-[#F0F4EF]" />
      )}

      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          priority
          className={`z-0 object-cover transition-opacity duration-500 ${
            shouldShowVideo ? "opacity-100" : isLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoadingComplete={() => setIsImageLoaded(true)}
        />
      )}

      {shouldShowVideo && (
        <video
          ref={videoRef}
          src={videoSrc}
          poster={src}
          preload="auto"
          className={`absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-500 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          onCanPlay={() => setIsVideoLoaded(true)}
          onPlaying={() => setIsVideoLoaded(true)}
          onError={() => setHasVideoError(true)}
        />
      )}
    </div>
  );
}