"use client";

import { useEffect } from "react";
import { runOnIdle } from "@/lib/run-on-idle";

// The bio-badge photo galleries (Human Dad / Dog Dad / Husband-to-be) only
// mount on hover, so their first request pays a cold Next image-optimizer
// transcode (~1–3s on a cold function). We can't preload eagerly without
// competing with the cover video for bandwidth/TTFB, so instead we warm the
// optimizer + browser cache once the page is idle. By then a hover hits the
// already-cached variant (~1ms) instead of the cold path.

// Next's default loader URL. Quality matches next/image's default (75).
function optimized(src: string, width: number) {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

// Widths Next will actually request for these galleries. With `fill` + the
// galleries' `sizes` (320px / 150px), it picks 384 at DPR1 and 640 at DPR2,
// so warming both covers every device.
const IMAGE_SOURCES = [
  "/IMG-20250922-WA0003.jpg", // dog-dad
  "/IMG-20250528-WA0009.jpg", // human-father
];
const WIDTHS = [384, 640];

// husband-to-be is a <video> with a poster — these are static assets served
// straight from /public (no optimizer), so warm the raw files.
const STATIC_SOURCES = ["/PXL_20210611_selfie.poster.jpg"];
const PREFETCH_SOURCES = ["/PXL_20210611_selfie.mp4"];

function warm() {
  for (const src of IMAGE_SOURCES) {
    for (const width of WIDTHS) {
      const img = new Image();
      img.fetchPriority = "low";
      img.decoding = "async";
      img.src = optimized(src, width);
    }
  }

  for (const src of STATIC_SOURCES) {
    const img = new Image();
    img.fetchPriority = "low";
    img.decoding = "async";
    img.src = src;
  }

  for (const src of PREFETCH_SOURCES) {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.as = "video";
    link.href = src;
    link.fetchPriority = "low";
    document.head.appendChild(link);
  }
}

export default function GalleryPreloader() {
  useEffect(() => {
    return runOnIdle(warm, { timeout: 3000 });
  }, []);

  return null;
}
