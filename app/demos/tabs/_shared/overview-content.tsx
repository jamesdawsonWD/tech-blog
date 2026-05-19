import { ContentMarker } from "./content-marker";

const metrics = [
  { label: "Active users", value: "12,483", delta: "+8.2%" },
  { label: "Avg. latency", value: "184ms", delta: "-12%" },
  { label: "Error rate", value: "0.42%", delta: "-3.1%" },
];

const bars = [42, 68, 34, 91, 57, 73, 48, 82, 61, 39, 77, 55];

export function OverviewContent() {
  return (
    <div className="space-y-4">
      <ContentMarker name="overview" />
      <h2 className="text-xl font-semibold text-zinc-50">Overview</h2>
      <div className="grid grid-cols-3 gap-3">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
            <div className="text-xs text-zinc-400">{m.label}</div>
            <div className="mt-2 text-2xl font-semibold tabular-nums text-zinc-50">{m.value}</div>
            <div className="mt-1 text-xs text-zinc-400">{m.delta}</div>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
        <div className="text-xs text-zinc-400 mb-3">Requests (last 24h)</div>
        <div className="flex items-end gap-2 h-32">
          {bars.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-zinc-400"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
