import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Action, ActionSource, SourceCtx, SourceState } from "./types";

type State = {
  query: string;
  sources: Record<string, SourceState>;
};

type Event =
  | { type: "query"; query: string }
  | { type: "loading"; id: string; query: string }
  | { type: "ready"; id: string; query: string; items: Action[] }
  | { type: "error"; id: string; query: string; error: unknown }
  | { type: "reset-source"; id: string };

function reducer(state: State, e: Event): State {
  switch (e.type) {
    case "query":
      return { ...state, query: e.query };
    case "loading":
      return { ...state, sources: { ...state.sources, [e.id]: { kind: "loading", query: e.query } } };
    case "ready":
      return { ...state, sources: { ...state.sources, [e.id]: { kind: "ready", query: e.query, items: e.items } } };
    case "error":
      return { ...state, sources: { ...state.sources, [e.id]: { kind: "error", query: e.query, error: e.error } } };
    case "reset-source":
      return { ...state, sources: { ...state.sources, [e.id]: { kind: "idle" } } };
  }
}

export type Orchestrator = {
  state: State;
  setQuery: (q: string) => void;
};

export function useOrchestrator(sources: ActionSource[], opts: { route: string }): Orchestrator {
  const [state, dispatch] = useReducer(reducer, { query: "", sources: {} });
  const controllers = useRef<Map<string, AbortController>>(new Map());
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const { query } = state;

    for (const source of sources) {
      controllers.current.get(source.id)?.abort();
      const prev = timers.current.get(source.id);
      if (prev) clearTimeout(prev);

      const ctrl = new AbortController();
      controllers.current.set(source.id, ctrl);
      const ctx: SourceCtx = { query, signal: ctrl.signal, route: opts.route };

      if (source.when && !source.when(ctx)) {
        dispatch({ type: "reset-source", id: source.id });
        continue;
      }

      let result: Action[] | Promise<Action[]>;
      try {
        result = source.getItems(ctx);
      } catch (error) {
        dispatch({ type: "error", id: source.id, query, error });
        continue;
      }

      if (!(result instanceof Promise)) {
        dispatch({ type: "ready", id: source.id, query, items: result });
        continue;
      }

      dispatch({ type: "loading", id: source.id, query });

      const fire = () => {
        result
          .then((items) => {
            if (ctrl.signal.aborted) return;
            dispatch({ type: "ready", id: source.id, query, items });
          })
          .catch((err) => {
            if (ctrl.signal.aborted) return;
            if (err?.name === "AbortError") return;
            dispatch({ type: "error", id: source.id, query, error: err });
          });
      };

      if (source.debounceMs && source.debounceMs > 0) {
        const t = setTimeout(fire, source.debounceMs);
        timers.current.set(source.id, t);
        ctrl.signal.addEventListener("abort", () => clearTimeout(t), { once: true });
      } else {
        fire();
      }
    }
  }, [state.query, sources, opts.route]);

  useEffect(
    () => () => {
      for (const c of controllers.current.values()) c.abort();
      for (const t of timers.current.values()) clearTimeout(t);
    },
    [],
  );

  const setQuery = useCallback((q: string) => dispatch({ type: "query", query: q }), []);
  return { state, setQuery };
}
