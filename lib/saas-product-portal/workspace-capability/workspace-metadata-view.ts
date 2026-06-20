import type { PortalWorkspace, WorkspaceMetadataView } from "../shared/portal-types";

export function buildWorkspaceMetadataView(workspace: PortalWorkspace): WorkspaceMetadataView {
  return {
    id: workspace.id,
    name: workspace.name,
    status: workspace.status,
    tenantId: workspace.tenantId,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
}
