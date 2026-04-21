"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, RotateCcw, ExternalLink } from "lucide-react";
import DeferredMount from "@/components/deferred-mount";
import { cn } from "@/lib/utils";

type Variant = "baseline" | "loading" | "cached";

const VARIANTS: { id: Variant; label: string }[] = [
  { id: "baseline", label: "Baseline" },
  { id: "loading", label: "+ loading.tsx" },
  { id: "cached", label: "+ cached" },
];

const START_TAB = "overview";

function lcpBucket(ms: number) {
  if (ms < 200) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (ms < 600) return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-red-200 bg-red-50 text-red-700";
}

export default function DemoFrame(props: { defaultVariant?: Variant }) {
  return (
    <DeferredMount minHeight={700} rootMargin="600px">
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
                : "border-zinc-200 bg-white text-muted-foreground"
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
            contentMs != null ? lcpBucket(contentMs) : "border-zinc-200 bg-white text-muted-foreground"
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

        <iframe
          ref={iframeRef}
          key={nonce}
          src={src}
          className="w-full h-[540px] bg-background"
          title={`tabs-${variant}`}
        />
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
