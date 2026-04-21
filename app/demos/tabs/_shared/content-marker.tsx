"use client";

import { useEffect } from "react";

function postPaint(kind: "content" | "skeleton", name: string) {
  if (typeof window === "undefined") return;
  if (window.parent === window) return;
  window.parent.postMessage(
    { type: "perf-tabs:painted", kind, name, t: performance.now() },
    "*"
  );
}

export function ContentMarker({ name }: { name: string }) {
  useEffect(() => {
    postPaint("content", name);
  }, [name]);
  return null;
}

export function SkeletonMarker({ name }: { name: string }) {
  useEffect(() => {
    postPaint("skeleton", name);
  }, [name]);
  return null;
}
