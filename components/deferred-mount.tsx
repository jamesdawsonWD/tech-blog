"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Reserved space so the placeholder doesn't collapse and cause CLS when children render. */
  minHeight: number;
  /** How far outside the viewport to start mounting. Larger = earlier mount. */
  rootMargin?: string;
  /** Idle timeout upper bound before forcing mount. */
  idleTimeoutMs?: number;
};

export default function DeferredMount({
  children,
  minHeight,
  rootMargin = "400px",
  idleTimeoutMs = 2000,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    let cancelled = false;
    const triggerMount = () => {
      if (cancelled) return;
      const w = window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      };
      if (typeof w.requestIdleCallback === "function") {
        w.requestIdleCallback(() => !cancelled && setMounted(true), {
          timeout: idleTimeoutMs,
        });
      } else {
        setTimeout(() => !cancelled && setMounted(true), 0);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          triggerMount();
        }
      },
      { rootMargin },
    );

    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [rootMargin, idleTimeoutMs]);

  if (mounted) return <>{children}</>;

  return (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      style={{ minHeight }}
    />
  );
}
