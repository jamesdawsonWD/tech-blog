import { useCallback, useState } from "react";
import type { Action, ActionCtx, AppRouterInstance, ToastInput } from "./types";

type ExecutorState =
  | { kind: "idle" }
  | { kind: "confirming"; action: Action };

type Deps = {
  router: AppRouterInstance;
  toast: (input: ToastInput) => void;
  close: () => void;
};

export type ExecutorAPI = {
  state: ExecutorState;
  request: (action: Action) => void;
  confirm: () => void;
  cancel: () => void;
};

export function useExecutor({ router, toast, close }: Deps): ExecutorAPI {
  const [state, setState] = useState<ExecutorState>({ kind: "idle" });

  const run = useCallback(
    async (action: Action) => {
      setState({ kind: "idle" });
      close();
      const controller = new AbortController();
      const ctx: ActionCtx = { router, signal: controller.signal, toast, close };
      try {
        await action.perform(ctx);
      } catch (err) {
        if (controller.signal.aborted) return;
        if (err instanceof Error && err.name === "AbortError") return;
        toast({
          kind: "error",
          title: `Failed: ${action.title}`,
          description: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [router, toast, close],
  );

  const request = useCallback(
    (action: Action) => {
      if (action.confirm) setState({ kind: "confirming", action });
      else void run(action);
    },
    [run],
  );

  const confirm = useCallback(() => {
    if (state.kind !== "confirming") return;
    void run(state.action);
  }, [state, run]);

  const cancel = useCallback(() => setState({ kind: "idle" }), []);

  return { state, request, confirm, cancel };
}
