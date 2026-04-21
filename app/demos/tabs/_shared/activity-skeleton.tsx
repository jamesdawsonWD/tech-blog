import { SkeletonMarker } from "./content-marker";

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-zinc-200 ${className}`} />;
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonMarker name="activity" />
      <Bar className="h-7 w-24" />
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Bar className="size-8 shrink-0 rounded-full" />
            <div className="flex-1 rounded-lg border border-zinc-200 bg-white p-3">
              <Bar className="h-3 w-16 mb-2" />
              <Bar className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
