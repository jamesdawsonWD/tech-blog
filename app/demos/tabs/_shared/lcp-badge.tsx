"use client";

import { useEffect, useState } from "react";

// Shared bucket → className mapping for latency badges, on the dark zinc
// palette used across the migrated demo. Also consumed by DemoFrame.
export function lcpBucket(ms: number) {
  if (ms < 200) return "border-emerald-800 bg-emerald-950 text-emerald-300";
  if (ms < 600) return "border-amber-800 bg-amber-950 text-amber-300";
  return "border-red-800 bg-red-950 text-red-300";
}

export function LcpBadge() {
  const [lcp, setLcp] = useState<number | null>(null);
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(typeof window !== "undefined" && window.parent !== window);
  }, []);

  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return;
    let locked = false;
    const observers: PerformanceObserver[] = [];

    function report(startTime: number) {
      if (locked) return;
      locked = true;
      setLcp(Math.round(startTime));
      observers.forEach((o) => o.disconnect());
    }

    // LCP often doesn't fire inside iframes; observe FCP as the fallback/primary.
    try {
      const lcpPo = new PerformanceObserver((list) => {
        const first = list.getEntries()[0];
        if (first) report(first.startTime);
      });
      lcpPo.observe({ type: "largest-contentful-paint", buffered: true });
      observers.push(lcpPo);
    } catch {}

    try {
      const paintPo = new PerformanceObserver((list) => {
        const fcp = list.getEntries().find((e) => e.name === "first-contentful-paint");
        if (fcp) report(fcp.startTime);
      });
      paintPo.observe({ type: "paint", buffered: true });
      observers.push(paintPo);
    } catch {}

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  if (embedded) return null;

  return (
    <div
      className={`fixed top-3 right-3 z-50 rounded-md border px-2 py-1 text-xs font-mono shadow-sm tabular-nums ${
        lcp != null ? lcpBucket(lcp) : "border-zinc-800 bg-zinc-900 text-zinc-50"
      }`}
    >
      LCP <span className="font-semibold">{lcp != null ? `${lcp}ms` : "…"}</span>
    </div>
  );
}
