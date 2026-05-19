import { ContentMarker } from "./content-marker";

const messages = [
  { role: "user", name: "You", text: "Summarise the last hour of errors." },
  { role: "assistant", name: "Agent", text: "42 errors total. 38 are timeout errors from /api/analytics, mostly between 14:05 and 14:12." },
  { role: "user", name: "You", text: "What changed around that window?" },
  { role: "assistant", name: "Agent", text: "A deploy went out at 14:03 bumping the postgres driver. I'd start there." },
];

export function ActivityContent() {
  return (
    <div className="space-y-4">
      <ContentMarker name="activity" />
      <h2 className="text-xl font-semibold text-zinc-50">Activity</h2>
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className="flex gap-3">
            <div className="size-8 shrink-0 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-200">
              {m.name[0]}
            </div>
            <div className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 p-3">
              <div className="text-xs text-zinc-400 mb-1">{m.name}</div>
              <div className="text-sm text-zinc-50">{m.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
