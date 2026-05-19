import { Search } from "lucide-react";

export function PaletteSkeletonInner() {
  return (
    <>
      <div className="flex items-center border-b px-3" aria-hidden>
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <div className="flex h-11 w-full items-center text-sm text-muted-foreground">
          Loading…
        </div>
      </div>
      <div className="h-[320px] overflow-y-auto p-2" aria-live="polite">
        <div className="px-2 py-3 text-sm text-muted-foreground">Loading commands…</div>
      </div>
    </>
  );
}
