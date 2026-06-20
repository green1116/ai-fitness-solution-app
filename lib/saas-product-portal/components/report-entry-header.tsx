"use client";

import { useWorkspaceContext } from "../hooks/use-workspace-context";
import { getReportEntryStatusView } from "../report-entry/report-entry-status";

export function ReportEntryHeader() {
  const { metadata, loading, error } = useWorkspaceContext();
  const statusView = getReportEntryStatusView();

  return (
    <header className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-amber-400/90">Workspace Business Layer</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">Report Entry</h2>
        <p className="mt-1 text-sm text-zinc-400">{statusView.summary}</p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4 text-sm">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Workspace Context</p>
        {loading ? (
          <p className="mt-2 text-zinc-400">Loading workspace context...</p>
        ) : error ? (
          <p className="mt-2 text-red-300">{error}</p>
        ) : metadata ? (
          <dl className="mt-2 grid gap-2 md:grid-cols-2">
            <div>
              <dt className="text-xs text-zinc-500">Workspace</dt>
              <dd className="font-medium text-white">{metadata.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Workspace Status</dt>
              <dd className="font-medium text-white">{metadata.status}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-xs text-zinc-500">Context Id</dt>
              <dd className="font-mono text-xs text-zinc-300">{metadata.id}</dd>
            </div>
          </dl>
        ) : (
          <p className="mt-2 text-zinc-400">Workspace context unavailable</p>
        )}
      </div>
    </header>
  );
}
