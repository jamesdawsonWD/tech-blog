// Run a callback once the browser is idle, falling back to setTimeout where
// requestIdleCallback is unavailable. Returns a cancel function that aborts
// the pending callback via cancelIdleCallback or clearTimeout as appropriate.

type IdleWindow = Window & {
  requestIdleCallback?: (
    cb: () => void,
    opts?: { timeout?: number }
  ) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function runOnIdle(
  cb: () => void,
  options: { timeout?: number } = {}
): () => void {
  const { timeout = 3000 } = options;

  if (typeof window === "undefined") return () => {};

  const w = window as IdleWindow;

  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }

  // Fallback timeout is shorter than the idle deadline so the work still
  // happens reasonably soon on browsers without requestIdleCallback.
  const id = window.setTimeout(cb, Math.min(timeout, 2000));
  return () => window.clearTimeout(id);
}
