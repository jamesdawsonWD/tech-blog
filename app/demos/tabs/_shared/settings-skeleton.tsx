import { SkeletonMarker } from "./content-marker";

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-zinc-200 ${className}`} />;
}

export function SettingsSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonMarker name="settings" />
      <Bar className="h-7 w-24" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-1.5">
            <Bar className="h-3 w-24" />
            <Bar className="h-9 w-full" />
          </div>
        ))}
        <Bar className="h-10 w-full" />
        <Bar className="h-9 w-32" />
      </div>
    </div>
  );
}
