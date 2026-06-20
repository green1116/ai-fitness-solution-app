import type { PortalWorkspace } from "../shared/portal-types";
import { formatPortalRelativeTimestamp, formatPortalTimestamp } from "../workspace/workspace-format";
import { WorkspacePanel } from "./workspace-panel";

interface WorkspaceMetadataPanelProps {
  workspace: PortalWorkspace;
}

export function WorkspaceMetadataPanel({ workspace }: WorkspaceMetadataPanelProps) {
  return (
    <WorkspacePanel title="Workspace metadata" description="Read-only fields from GET /api/saas-product/workspaces/[id]">
      <dl className="grid gap-4 text-sm md:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Name</dt>
          <dd className="mt-1 font-medium text-white">{workspace.name}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Status</dt>
          <dd className="mt-1 font-medium text-white">{workspace.status}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Workspace ID</dt>
          <dd className="mt-1 font-medium text-white">{workspace.id}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Tenant</dt>
          <dd className="mt-1 font-medium text-white">{workspace.tenantId}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Created</dt>
          <dd className="mt-1 text-zinc-300">{formatPortalTimestamp(workspace.createdAt)}</dd>
          <dd className="text-xs text-zinc-500">{formatPortalRelativeTimestamp(workspace.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Updated</dt>
          <dd className="mt-1 text-zinc-300">{formatPortalTimestamp(workspace.updatedAt)}</dd>
          <dd className="text-xs text-zinc-500">{formatPortalRelativeTimestamp(workspace.updatedAt)}</dd>
        </div>
      </dl>
    </WorkspacePanel>
  );
}
