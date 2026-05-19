"use client";

import { PaletteHost } from "./palette-host";

export default function CmdKDemo() {
  return (
    <div className="not-prose my-8 rounded-xl border bg-muted/30 p-6">
      <p className="mb-4 text-sm text-muted-foreground">
        Press <kbd className="rounded border bg-background px-1.5 font-mono text-xs">⌘K</kbd> (or{" "}
        <kbd className="rounded border bg-background px-1.5 font-mono text-xs">Ctrl+K</kbd>) — or
        click the button below. Try typing, arrow nav, Enter, Esc. Try <code>deploy</code> or{" "}
        <code>delete</code> for confirm flows.
      </p>
      <PaletteHost />
    </div>
  );
}
