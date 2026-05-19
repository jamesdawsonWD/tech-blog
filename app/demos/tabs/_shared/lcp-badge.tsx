"use client";

import { useEffect, useState } from "react";

function lcpColor(ms: number) {
  if (ms < 200) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (ms < 600) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
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
        lcp != null ? lcpColor(lcp) : "border-zinc-800 bg-zinc-900 text-zinc-50"
      }`}
    >
      LCP <span className="font-semibold">{lcp != null ? `${lcp}ms` : "…"}</span>
    </div>
  );
}
