"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RotateCcw, ExternalLink } from "lucide-react";
import DeferredMount from "@/components/deferred-mount";
import { cn } from "@/lib/utils";
import { runOnIdle } from "@/lib/run-on-idle";
import { lcpBucket } from "@/app/demos/tabs/_shared/lcp-badge";

type Variant = "baseline" | "loading" | "cached";

const VARIANTS: { id: Variant; label: string }[] = [
  { id: "baseline", label: "Baseline" },
  { id: "loading", label: "+ loading.tsx" },
  { id: "cached", label: "+ cached" },
];

const START_TAB = "overview";

export default function DemoFrame(props: { defaultVariant?: Variant }) {
  const variant = props.defaultVariant ?? "baseline";

  // Warm the demo route on idle, before DeferredMount ever mounts the iframe.
  // On production these routes are cold serverless functions, so prefetching
  // the document eliminates the cold start the user sees when scrolling in.
  useEffect(() => {
    const href = `/demos/tabs/${variant}/${START_TAB}?delay=400&t=0`;
    const run = () => {
      if (document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "document";
      link.href = href;
      document.head.appendChild(link);
    };
    const cancel = runOnIdle(run, { timeout: 3000 });
    return cancel;
  }, [variant]);

  return (
    <DeferredMount minHeight={700} rootMargin="1200px">
      <DemoFrameInner {...props} />
    </DeferredMount>
  );
}

function DemoFrameInner({
  defaultVariant = "baseline",
}: {
  defaultVariant?: Variant;
}) {
  const [variant, setVariant] = useState<Variant>(defaultVariant);
  const [delay, setDelay] = useState(400);
  const [nonce, setNonce] = useState(0);
  const [currentPath, setCurrentPath] = useState(`/demos/tabs/${defaultVariant}/${START_TAB}`);
  const [skeletonMs, setSkeletonMs] = useState<number | null>(null);
  const [contentMs, setContentMs] = useState<number | null>(null);
  const [waitingSkeleton, setWaitingSkeleton] = useState(false);
  const [waitingContent, setWaitingContent] = useState(false);
  const [frameLoading, setFrameLoading] = useState(true);
  const lastClickRef = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const src = useMemo(
    () => `/demos/tabs/${variant}/${START_TAB}?delay=${delay}&t=${nonce}`,
    [variant, delay, nonce]
  );

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data;
      if (!data || typeof data !== "object") return;
      if (data.type === "perf-tabs:click") {
        lastClickRef.current = data.t;
        setSkeletonMs(null);
        setContentMs(null);
        setWaitingSkeleton(true);
        setWaitingContent(true);
        setCurrentPath(data.href);
      } else if (data.type === "perf-tabs:painted") {
        const clicked = lastClickRef.current;
        if (clicked == null) return;
        const elapsed = Math.round(data.t - clicked);
        if (data.kind === "skeleton") {
          setSkeletonMs(elapsed);
          setWaitingSkeleton(false);
        } else if (data.kind === "content") {
          setContentMs(elapsed);
          setWaitingSkeleton(false);
          setWaitingContent(false);
        }
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    setSkeletonMs(null);
    setContentMs(null);
    setWaitingSkeleton(false);
    setWaitingContent(false);
    lastClickRef.current = null;
    setCurrentPath(`/demos/tabs/${variant}/${START_TAB}`);
  }, [variant, nonce]);

  // Show the loader whenever the iframe document reloads (variant / delay /
  // cold-reset all change `src`). Internal tab clicks don't change `src`, so
  // the loader stays out of the way of the demo itself.
  useEffect(() => {
    setFrameLoading(true);
  }, [src]);

  function resetCold() {
    setNonce(Date.now());
  }


  return (
    <div className="not-prose my-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {variant !== "baseline" && (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-mono tabular-nums",
              skeletonMs != null
                ? lcpBucket(skeletonMs)
                : "border-zinc-800 bg-zinc-900 text-muted-foreground"
            )}
            title="Time from tab click to skeleton painted"
          >
            Skeleton
            {skeletonMs != null ? (
              <span className="font-semibold">{skeletonMs}ms</span>
            ) : waitingSkeleton ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <span className="font-semibold">—</span>
            )}
          </div>
        )}
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-mono tabular-nums",
            contentMs != null ? lcpBucket(contentMs) : "border-zinc-800 bg-zinc-900 text-muted-foreground"
          )}
          title="Time from tab click to content painted"
        >
          Content
          {contentMs != null ? (
            <span className="font-semibold">{contentMs}ms</span>
          ) : waitingContent ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <span className="font-semibold">—</span>
          )}
        </div>
        <button
          type="button"
          onClick={resetCold}
          title="Reset (cold)"
          aria-label="Reset (cold)"
          className="inline-flex items-center justify-center rounded-md border p-1.5 text-xs hover:bg-muted"
        >
          <RotateCcw className="size-3.5" />
        </button>
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          title="Open in new tab"
          aria-label="Open in new tab"
          className="inline-flex items-center justify-center rounded-md border p-1.5 text-xs text-foreground no-underline hover:bg-muted"
        >
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground border-b flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 font-mono truncate">{currentPath}</span>
        </div>

        <div className="relative h-[540px]">
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background transition-opacity duration-300",
              frameLoading ? "opacity-100" : "opacity-0"
            )}
          >
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
          <iframe
            ref={iframeRef}
            key={nonce}
            src={src}
            onLoad={() => setFrameLoading(false)}
            className="w-full h-full bg-background"
            title={`tabs-${variant}`}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <div className="inline-flex gap-1 rounded-md bg-muted p-1">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVariant(v.id)}
              className={cn(
                "px-3 py-1 rounded-sm text-xs font-medium transition-colors",
                variant === v.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Delay
          <input
            type="range"
            min={0}
            max={1500}
            step={50}
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            className="w-28 accent-foreground"
          />
          <span className="tabular-nums w-12 text-foreground">{delay}ms</span>
        </label>
      </div>
    </div>
  );
}
