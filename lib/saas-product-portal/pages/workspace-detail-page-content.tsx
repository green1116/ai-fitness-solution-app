"use client";

import Link from "next/link";
import { WorkspaceMetadataPanel } from "../components/workspace-metadata-panel";
import { WorkspacePanel } from "../components/workspace-panel";
import { WorkspaceStatusActions } from "../components/workspace-status-actions";
import { useWorkspaceDetail } from "../hooks/use-workspace-detail";
import { SAAS_PRODUCT_PORTAL_WORKSPACES_PATH } from "../shared/portal-constants";

interface WorkspaceDetailPageContentProps {
  workspaceId: string;
}

export function WorkspaceDetailPageContent({ workspaceId }: WorkspaceDetailPageContentProps) {
  const { workspace, loading, error, statusPending, statusError, updateStatus } = useWorkspaceDetail(workspaceId);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <Link href={SAAS_PRODUCT_PORTAL_WORKSPACES_PATH} className="text-xs text-amber-400 hover:text-amber-300">
          ← Back to workspaces
        </Link>
        <h3 className="text-2xl font-semibold">Workspace detail</h3>
        <p className="text-sm text-zinc-400">P4 read-only metadata + PATCH status actions</p>
      </section>

      {loading ? (
        <WorkspacePanel title="Loading" description="Fetching workspace detail">
          <p className="text-sm text-zinc-400">Loading workspace...</p>
        </WorkspacePanel>
      ) : null}

      {error ? (
        <section className="rounded-xl border border-red-900/60 bg-red-950/20 p-4 text-sm text-red-300">
          {error}
        </section>
      ) : null}

      {workspace ? (
        <>
          <WorkspaceMetadataPanel workspace={workspace} />
          <WorkspacePanel title="Status actions" description="Archive or activate via PATCH">
            <WorkspaceStatusActions
              workspace={workspace}
              pending={statusPending}
              error={statusError}
              onArchive={() => updateStatus("ARCHIVED")}
              onActivate={() => updateStatus("ACTIVE")}
            />
          </WorkspacePanel>
        </>
      ) : null}
    </div>
  );
}
