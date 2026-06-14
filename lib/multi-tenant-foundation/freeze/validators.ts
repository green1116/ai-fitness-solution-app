import type {
  MembershipInvitation,
  MultiTenantFreezeValidation,
  MultiTenantWorkflowPathResult,
  OrganizationType,
} from "../shared/types";
import { buildAccessControlValidation } from "../access-control/builders";
import { advanceMembershipWorkflow } from "../membership-workflow/builders";
import { buildWorkspaceCollaborationReport } from "../workspace-collaboration/builders";
import { getWorkspaceById } from "../workspace";
import { validateCollaborationLayer } from "../validation/collaboration-validators";
import { validateMultiTenantFoundation } from "../validation/validators";
import {
  MULTI_TENANT_VALIDATION_GATES,
  MULTI_TENANT_WORKFLOW_WORKSPACES,
} from "./constants";

function defaultRoleForWorkspaceType(workspaceType: OrganizationType): string {
  if (workspaceType === "brand") return "role-brand-admin";
  if (workspaceType === "supplier") return "role-supplier-admin";
  return "role-tender-owner-admin";
}

export function validateMembershipWorkflowPath(
  workspaceId: string,
): MultiTenantWorkflowPathResult {
  const workspace = getWorkspaceById(workspaceId);
  if (!workspace) {
    return {
      workspaceId,
      workspaceName: workspaceId,
      workspaceType: "brand",
      finalStatus: "pending",
      pathValid: false,
    };
  }

  let invitation: MembershipInvitation = {
    invitationId: `workflow-${workspaceId}`,
    workspaceId,
    email: `workflow@${workspaceId.replace("workspace-", "")}.cn`,
    role: defaultRoleForWorkspaceType(workspace.workspaceType),
    status: "pending",
    mode: "multi-tenant",
  };

  while (invitation.status !== "active") {
    if (invitation.status === "removed") {
      return {
        workspaceId,
        workspaceName: workspace.workspaceName,
        workspaceType: workspace.workspaceType,
        finalStatus: invitation.status,
        pathValid: false,
      };
    }
    const next = advanceMembershipWorkflow(invitation);
    if (next.status === invitation.status) {
      return {
        workspaceId,
        workspaceName: workspace.workspaceName,
        workspaceType: workspace.workspaceType,
        finalStatus: invitation.status,
        pathValid: false,
      };
    }
    invitation = next;
  }

  return {
    workspaceId,
    workspaceName: workspace.workspaceName,
    workspaceType: workspace.workspaceType,
    finalStatus: "active",
    pathValid: true,
  };
}

export function validateMultiTenantFreeze(): MultiTenantFreezeValidation {
  const phase1 = validateMultiTenantFoundation();
  const collaboration = validateCollaborationLayer();
  const accessControl = buildAccessControlValidation();
  const collaborationReport = buildWorkspaceCollaborationReport();

  const workflowPaths = MULTI_TENANT_WORKFLOW_WORKSPACES.map(validateMembershipWorkflowPath);
  const workflowPathValid = workflowPaths.every((path) => path.pathValid);

  const phase2Valid =
    collaboration.valid &&
    accessControl.valid &&
    collaborationReport.validation.valid;

  const layerCompatibility =
    phase1.v26BrandCompatible && phase1.v27SupplierCompatible && phase1.v28TenderCompatible;

  const gates = [
    phase1.organizationExists,
    phase1.workspaceExists,
    phase1.membershipExists,
    phase1.roleExists,
    phase1.permissionExists,
    layerCompatibility,
    phase1.valid,
    phase2Valid,
    accessControl.roleValid,
    accessControl.permissionValid,
    accessControl.resourceValid,
    workflowPathValid,
  ];

  const validationScore = Math.round(
    (gates.filter(Boolean).length / MULTI_TENANT_VALIDATION_GATES) * 100,
  );
  const valid = phase1.valid && phase2Valid && workflowPathValid && validationScore === 100;

  return {
    valid,
    phase1Valid: phase1.valid,
    phase2Valid,
    workflowPathValid,
    validationScore,
  };
}

export { MULTI_TENANT_VALIDATION_GATES };
