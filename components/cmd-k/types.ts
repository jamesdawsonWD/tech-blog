import type { ComponentType } from "react";
import type { useRouter } from "next/navigation";

export type AppRouterInstance = ReturnType<typeof useRouter>;

export type ToastInput = {
  kind?: "default" | "success" | "error";
  title: string;
  description?: string;
};

export type ActionCtx = {
  router: AppRouterInstance;
  signal: AbortSignal;
  toast: (input: ToastInput) => void;
  close: () => void;
};

export type ConfirmConfig = {
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
};

export type Action = {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string[];
  icon?: ComponentType<{ className?: string }>;
  section?: string;
  shortcut?: string[];
  // Prefetch hint: if set, palette calls router.prefetch(href) on highlight.
  // Does NOT replace `perform` — perform is still the source of truth for what happens.
  href?: string;
  when?: (ctx: SourceCtx) => boolean;
  perform: (ctx: ActionCtx) => void | Promise<void>;
  confirm?: ConfirmConfig;
};

export type SourceCtx = {
  query: string;
  signal: AbortSignal;
  route: string;
};

export type ActionSource = {
  id: string;
  section: string;
  priority?: number;
  when?: (ctx: SourceCtx) => boolean;
  debounceMs?: number;
  getItems: (ctx: SourceCtx) => Action[] | Promise<Action[]>;
};

export type SourceState =
  | { kind: "idle" }
  | { kind: "loading"; query: string }
  | { kind: "ready"; query: string; items: Action[] }
  | { kind: "error"; query: string; error: unknown };
