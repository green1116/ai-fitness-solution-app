import type {
  MembershipInvitation,
  MembershipInvitationStatus,
  MembershipWorkflow,
} from "../shared/types";
import { MEMBERSHIP_INVITATION_WORKFLOW_STATES } from "../shared/types";

function resolveWorkflowIndex(status: MembershipInvitationStatus): number {
  if (status === "removed") {
    return MEMBERSHIP_INVITATION_WORKFLOW_STATES.indexOf("active");
  }
  const index = MEMBERSHIP_INVITATION_WORKFLOW_STATES.indexOf(
    status as (typeof MEMBERSHIP_INVITATION_WORKFLOW_STATES)[number],
  );
  return index >= 0 ? index : 0;
}

export function buildMembershipWorkflow(invitation: MembershipInvitation): MembershipWorkflow {
  const currentIndex = resolveWorkflowIndex(invitation.status);
  const isRemoved = invitation.status === "removed";
  const isActive = invitation.status === "active";

  const activeIndex = MEMBERSHIP_INVITATION_WORKFLOW_STATES.indexOf("active");
  const removedIndex = MEMBERSHIP_INVITATION_WORKFLOW_STATES.indexOf("removed");

  const steps = MEMBERSHIP_INVITATION_WORKFLOW_STATES.map((status, index) => ({
    status,
    completed: isRemoved
      ? index <= removedIndex
      : isActive
        ? index <= activeIndex
        : index < currentIndex,
    current: !isRemoved && !isActive && index === currentIndex,
  }));

  let nextStatus: MembershipInvitationStatus | null = null;
  if (invitation.status === "removed" || invitation.status === "active") {
    nextStatus = null;
  } else if (currentIndex < MEMBERSHIP_INVITATION_WORKFLOW_STATES.length - 1) {
    nextStatus = MEMBERSHIP_INVITATION_WORKFLOW_STATES[currentIndex + 1];
  }

  return {
    invitationId: invitation.invitationId,
    workspaceId: invitation.workspaceId,
    email: invitation.email,
    currentStatus: invitation.status,
    steps,
    nextStatus,
  };
}

export function advanceMembershipWorkflow(
  invitation: MembershipInvitation,
): MembershipInvitation {
  const workflow = buildMembershipWorkflow(invitation);
  if (!workflow.nextStatus) return invitation;

  return {
    ...invitation,
    status: workflow.nextStatus,
  };
}
