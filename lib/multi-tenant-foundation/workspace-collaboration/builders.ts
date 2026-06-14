import { buildAccessControlValidation } from "../access-control/builders";
import { getAccessRulesByRole } from "../access-control/data";
import { getMembershipsByWorkspaceId } from "../membership";
import { getMembershipInvitationsByWorkspaceId } from "../membership-workflow/data";
import { getAllPermissions } from "../permission";
import { getAllRoles } from "../role";
import type { WorkspaceCollaborationReport } from "../shared/types";
import {
  CANONICAL_COLLABORATION_WORKSPACES,
  MULTI_TENANT_VERSION,
} from "../shared/types";
import { getAllWorkspaces, getWorkspaceById } from "../workspace";
import { validateCollaborationLayer } from "../validation/collaboration-validators";
import { getWorkspaceCollaborationsByWorkspaceId } from "./data";

function countPermissionsForWorkspace(workspaceId: string): number {
  const memberships = getMembershipsByWorkspaceId(workspaceId);
  const roleIds = new Set(memberships.map((membership) => membership.roleId));
  const permissionIds = new Set<string>();

  for (const roleId of roleIds) {
    for (const rule of getAccessRulesByRole(roleId)) {
      if (rule.allowed) {
        const role = getAllRoles().find((entry) => entry.roleId === roleId);
        role?.permissionIds.forEach((permissionId) => permissionIds.add(permissionId));
      }
    }
  }

  return permissionIds.size > 0 ? permissionIds.size : getAllPermissions().length > 0 ? 1 : 0;
}

function buildWorkspaceEntry(workspaceId: string) {
  const workspace = getWorkspaceById(workspaceId);
  if (!workspace) {
    return {
      workspaceId,
      workspaceName: workspaceId,
      workspaceType: "brand" as const,
      memberCount: 0,
      resourceCount: 0,
      permissionCount: 0,
      collaborationEnabled: false,
    };
  }

  const memberships = getMembershipsByWorkspaceId(workspaceId);
  const invitations = getMembershipInvitationsByWorkspaceId(workspaceId);
  const collaborations = getWorkspaceCollaborationsByWorkspaceId(workspaceId);
  const activeMembers = memberships.length + invitations.filter((i) => i.status === "active").length;

  return {
    workspaceId: workspace.workspaceId,
    workspaceName: workspace.workspaceName,
    workspaceType: workspace.workspaceType,
    memberCount: activeMembers,
    resourceCount: collaborations.length,
    permissionCount: countPermissionsForWorkspace(workspaceId),
    collaborationEnabled:
      activeMembers > 0 && collaborations.length > 0 && countPermissionsForWorkspace(workspaceId) > 0,
  };
}

export function buildWorkspaceCollaborationReport(): WorkspaceCollaborationReport {
  const validation = validateCollaborationLayer();
  const canonicalWorkspaceIds = [
    CANONICAL_COLLABORATION_WORKSPACES.brand,
    CANONICAL_COLLABORATION_WORKSPACES.supplier,
    CANONICAL_COLLABORATION_WORKSPACES.tender,
  ];
  const canonicalSet = new Set<string>(canonicalWorkspaceIds);
  const otherWorkspaceIds = getAllWorkspaces()
    .map((workspace) => workspace.workspaceId)
    .filter((workspaceId) => !canonicalSet.has(workspaceId));

  const workspaces = [...canonicalWorkspaceIds, ...otherWorkspaceIds].map(buildWorkspaceEntry);

  return {
    version: MULTI_TENANT_VERSION,
    reportId: `workspace-collaboration-report-${Date.now()}`,
    workspaces,
    validation,
    summary: [
      "workspace-collaboration-report",
      `workspaces=${workspaces.length}`,
      `brandCollaboration=${validation.brandWorkspaceCollaboration}`,
      `supplierCollaboration=${validation.supplierWorkspaceCollaboration}`,
      `tenderCollaboration=${validation.tenderWorkspaceCollaboration}`,
      `accessControlValid=${validation.accessControlValid}`,
      `valid=${validation.valid}`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
