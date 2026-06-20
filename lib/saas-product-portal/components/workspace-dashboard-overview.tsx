"use client";

import { useWorkspaceContext } from "../hooks/use-workspace-context";
import { formatPortalRelativeTimestamp, formatPortalTimestamp } from "../workspace/workspace-format";
import { WorkspacePanel } from "./workspace-panel";

export function WorkspaceDashboardOverview() {
  const { metadata, loading, error } = useWorkspaceContext();

  if (loading) {
    return (
      <WorkspacePanel title="Workspace Overview" description="Loading workspace dashboard">
        <p className="text-sm text-zinc-400">Loading workspace overview...</p>
      </WorkspacePanel>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-red-900/60 bg-red-950/20 p-4 text-sm text-red-300">{error}</section>
    );
  }

  if (!metadata) {
    return null;
  }

  return (
    <WorkspacePanel title="Workspace Overview" description="Read-only dashboard via workspace context">
      <dl className="grid gap-4 text-sm md:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Workspace</dt>
          <dd className="mt-1 font-medium text-white">{metadata.name}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Status</dt>
          <dd className="mt-1 font-medium text-white">{metadata.status}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Created</dt>
          <dd className="mt-1 text-zinc-300">{formatPortalTimestamp(metadata.createdAt)}</dd>
          <dd className="text-xs text-zinc-500">{formatPortalRelativeTimestamp(metadata.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Updated</dt>
          <dd className="mt-1 text-zinc-300">{formatPortalTimestamp(metadata.updatedAt)}</dd>
          <dd className="text-xs text-zinc-500">{formatPortalRelativeTimestamp(metadata.updatedAt)}</dd>
        </div>
        <div className="md:col-span-2">
          <dt className="text-zinc-500">Metadata</dt>
          <dd className="mt-1 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3 font-mono text-xs text-zinc-300">
            id={metadata.id} · tenant={metadata.tenantId}
          </dd>
        </div>
      </dl>
    </WorkspacePanel>
  );
}
