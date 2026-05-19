"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Command as CommandPrimitive } from "cmdk";
import {
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command";
import { useOrchestrator } from "./orchestrator";
import { useExecutor } from "./executor";
import { defaultSources } from "./sources";
import { ConfirmStep } from "./confirm-step";
import { SectionSkeleton } from "./section-skeleton";
import { usePrefetchOnHighlight } from "./use-prefetch-on-highlight";
import type { Action, ActionSource, ToastInput } from "./types";

const toastShim = (input: ToastInput) => {
  const opts = input.description ? { description: input.description } : undefined;
  if (input.kind === "error") toast.error(input.title, opts);
  else if (input.kind === "success") toast.success(input.title, opts);
  else toast(input.title, opts);
};

type Props = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  sources?: ActionSource[];
};

export default function CommandPalette({ open, onOpenChange, sources = defaultSources }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [highlighted, setHighlighted] = useState<string>("");

  const { state, setQuery } = useOrchestrator(sources, { route: pathname || "/" });

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);
  const executor = useExecutor({ router, toast: toastShim, close });

  const indexed = useMemo(() => {
    const m = new Map<string, Action>();
    for (const src of sources) {
      const s = state.sources[src.id];
      if (s?.kind === "ready") for (const a of s.items) m.set(a.id, a);
    }
    return m;
  }, [state.sources, sources]);

  usePrefetchOnHighlight(highlighted, indexed, router);

  const ordered = useMemo(
    () => [...sources].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100)),
    [sources],
  );

  useEffect(() => {
    if (!open && executor.state.kind === "confirming") executor.cancel();
  }, [open, executor]);

  if (executor.state.kind === "confirming") {
    return (
      <ConfirmStep
        action={executor.state.action}
        onConfirm={executor.confirm}
        onCancel={executor.cancel}
      />
    );
  }

  return (
    <CommandPrimitive
      value={highlighted}
      onValueChange={setHighlighted}
      className="flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2.5 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
    >
      <CommandInput
        placeholder="Search or run a command…"
        value={state.query}
        onValueChange={setQuery}
        autoFocus
      />
      <CommandList className="h-[320px] max-h-[320px]">
        <CommandEmpty>No results.</CommandEmpty>
        {ordered.map((source) => {
          const s = state.sources[source.id];
          if (!s) return null;

          if (s.kind === "loading") {
            return <SectionSkeleton key={source.id} heading={source.section} />;
          }

          if (s.kind === "ready" && s.items.length > 0) {
            return (
              <CommandGroup key={source.id} heading={source.section}>
                {s.items.map((action) => (
                  <CommandItem
                    key={action.id}
                    value={action.id}
                    keywords={[action.title, ...(action.keywords ?? [])]}
                    onSelect={() => executor.request(action)}
                  >
                    {action.icon ? <action.icon className="mr-2 h-4 w-4" /> : null}
                    <div className="flex flex-col">
                      <span>{action.title}</span>
                      {action.subtitle ? (
                        <span className="text-xs text-muted-foreground">{action.subtitle}</span>
                      ) : null}
                    </div>
                    {action.shortcut ? (
                      <CommandShortcut>{action.shortcut.join(" ")}</CommandShortcut>
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          }

          return null;
        })}
      </CommandList>
    </CommandPrimitive>
  );
}
