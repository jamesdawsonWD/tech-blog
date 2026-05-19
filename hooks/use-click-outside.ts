import { useEffect, type RefObject } from "react";

/**
 * Calls `handler` when a `pointerdown` occurs outside the referenced element.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: PointerEvent) => void,
) {
  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const el = ref.current;
      if (!el) return;

      const target = event.target as Node;
      if (!el.contains(target)) {
        handler(event);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown);
  }, [ref, handler]);
}
