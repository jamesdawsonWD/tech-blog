import { ContentMarker } from "./content-marker";

const fields = [
  { label: "Workspace name", value: "Acme Analytics" },
  { label: "Default region", value: "eu-west-1" },
  { label: "Alert email", value: "ops@acme.com" },
];

export function SettingsContent() {
  return (
    <div className="space-y-4">
      <ContentMarker name="settings" />
      <h2 className="text-xl font-semibold text-zinc-900">Settings</h2>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.label} className="space-y-1.5">
            <div className="text-xs text-zinc-500">{f.label}</div>
            <div className="h-9 rounded-md border border-zinc-200 bg-white px-3 flex items-center text-sm text-zinc-900">
              {f.value}
            </div>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-3 py-2">
          <div className="text-sm text-zinc-900">Email me on new errors</div>
          <div className="h-5 w-9 rounded-full bg-zinc-900 relative">
            <div className="absolute right-0.5 top-0.5 size-4 rounded-full bg-white" />
          </div>
        </div>
        <button className="h-9 rounded-md bg-zinc-900 text-white px-4 text-sm font-medium">
          Save changes
        </button>
      </div>
    </div>
  );
}
