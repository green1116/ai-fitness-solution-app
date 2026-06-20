"use client";

import type { PortalWorkspace, PortalWorkspaceStatus } from "../shared/portal-types";

interface WorkspaceStatusActionsProps {
  workspace: PortalWorkspace;
  pending?: boolean;
  error?: string | null;
  onArchive: () => Promise<void>;
  onActivate: () => Promise<void>;
}

export function WorkspaceStatusActions({
  workspace,
  pending = false,
  error,
  onArchive,
  onActivate,
}: WorkspaceStatusActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {workspace.status === "ACTIVE" ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => void onArchive()}
          className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900 disabled:opacity-60"
        >
          {pending ? "Updating..." : "Archive"}
        </button>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => void onActivate()}
          className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          {pending ? "Updating..." : "Activate"}
        </button>
      )}
      <p className="text-xs text-zinc-500">PATCH /api/saas-product/workspaces/[id] · status only</p>
      {error ? <p className="w-full text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

export function nextWorkspaceStatusAction(status: PortalWorkspaceStatus): PortalWorkspaceStatus {
  return status === "ACTIVE" ? "ARCHIVED" : "ACTIVE";
}
