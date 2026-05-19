import { SkeletonMarker } from "./content-marker";

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-zinc-700 ${className}`} />;
}

export function OverviewSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonMarker name="overview" />
      <Bar className="h-7 w-28" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
            <Bar className="h-3 w-20" />
            <Bar className="mt-3 h-7 w-24" />
            <Bar className="mt-2 h-3 w-12" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
        <Bar className="h-3 w-32 mb-3" />
        <div className="flex items-end gap-2 h-32">
          {Array.from({ length: 12 }).map((_, i) => (
            <Bar key={i} className="flex-1 h-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
