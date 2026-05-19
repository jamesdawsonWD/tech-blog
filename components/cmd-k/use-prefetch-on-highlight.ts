import { useEffect, useRef } from "react";
import type { Action, AppRouterInstance } from "./types";

const DEBOUNCE_MS = 80;

export function usePrefetchOnHighlight(
  highlightedValue: string,
  index: Map<string, Action>,
  router: AppRouterInstance,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const action = index.get(highlightedValue);
      if (!action?.href) return;
      if (seen.current.has(action.href)) return;
      seen.current.add(action.href);
      router.prefetch(action.href);
    }, DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [highlightedValue, index, router]);
}
