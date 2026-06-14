import { buildAccessControlValidation } from "../access-control/builders";
import { getMembershipsByWorkspaceId } from "../membership";
import { getMembershipInvitationsByWorkspaceId } from "../membership-workflow/data";
import type { CollaborationLayerValidation } from "../shared/types";
import { CANONICAL_COLLABORATION_WORKSPACES } from "../shared/types";
import { getWorkspaceCollaborationsByWorkspaceId } from "../workspace-collaboration/data";

function validateWorkspaceCollaboration(workspaceId: string): boolean {
  const memberships = getMembershipsByWorkspaceId(workspaceId);
  const invitations = getMembershipInvitationsByWorkspaceId(workspaceId);
  const collaborations = getWorkspaceCollaborationsByWorkspaceId(workspaceId);
  const activeInvitations = invitations.filter((invitation) => invitation.status === "active");

  return (
    memberships.length > 0 &&
    activeInvitations.length > 0 &&
    collaborations.length > 0
  );
}

export function validateCollaborationLayer(): CollaborationLayerValidation {
  const accessControl = buildAccessControlValidation();

  const brandWorkspaceCollaboration = validateWorkspaceCollaboration(
    CANONICAL_COLLABORATION_WORKSPACES.brand,
  );
  const supplierWorkspaceCollaboration = validateWorkspaceCollaboration(
    CANONICAL_COLLABORATION_WORKSPACES.supplier,
  );
  const tenderWorkspaceCollaboration = validateWorkspaceCollaboration(
    CANONICAL_COLLABORATION_WORKSPACES.tender,
  );

  return {
    valid:
      accessControl.valid &&
      brandWorkspaceCollaboration &&
      supplierWorkspaceCollaboration &&
      tenderWorkspaceCollaboration,
    brandWorkspaceCollaboration,
    supplierWorkspaceCollaboration,
    tenderWorkspaceCollaboration,
    accessControlValid: accessControl.valid,
  };
}
