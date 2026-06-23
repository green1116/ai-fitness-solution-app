export function VersionBadge({ version, isLatest }: { version: number; isLatest: boolean }) {
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 font-mono text-xs ${
        isLatest
          ? "bg-emerald-950 text-emerald-300 ring-1 ring-emerald-800"
          : "bg-zinc-900 text-zinc-400 ring-1 ring-zinc-700"
      }`}
    >
      {isLatest ? `v${version} · Latest` : `v${version} · Archived`}
    </span>
  );
}
