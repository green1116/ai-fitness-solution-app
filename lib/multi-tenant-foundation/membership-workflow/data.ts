import type { MembershipInvitation } from "../shared/types";

export const MEMBERSHIP_INVITATIONS: MembershipInvitation[] = [
  {
    invitationId: "invite-brand-lf-admin",
    workspaceId: "workspace-brand-life-fitness",
    email: "admin@lifefitness.cn",
    role: "role-brand-admin",
    status: "active",
    mode: "multi-tenant",
  },
  {
    invitationId: "invite-brand-lf-editor",
    workspaceId: "workspace-brand-life-fitness",
    email: "editor@lifefitness.cn",
    role: "role-brand-editor",
    status: "active",
    mode: "multi-tenant",
  },
  {
    invitationId: "invite-brand-tg-pending",
    workspaceId: "workspace-brand-technogym",
    email: "pending@technogym.cn",
    role: "role-brand-editor",
    status: "pending",
    mode: "multi-tenant",
  },
  {
    invitationId: "invite-brand-mx-accepted",
    workspaceId: "workspace-brand-matrix",
    email: "accepted@matrix.cn",
    role: "role-brand-admin",
    status: "accepted",
    mode: "multi-tenant",
  },
  {
    invitationId: "invite-supplier-lf-admin",
    workspaceId: "workspace-supplier-life-fitness-cn",
    email: "supplier.admin@lifefitness.cn",
    role: "role-supplier-admin",
    status: "active",
    mode: "multi-tenant",
  },
  {
    invitationId: "invite-supplier-lf-editor",
    workspaceId: "workspace-supplier-life-fitness-cn",
    email: "supplier.editor@lifefitness.cn",
    role: "role-supplier-editor",
    status: "active",
    mode: "multi-tenant",
  },
  {
    invitationId: "invite-supplier-tg-pending",
    workspaceId: "workspace-supplier-technogym-cn",
    email: "pending@technogym-supplier.cn",
    role: "role-supplier-editor",
    status: "pending",
    mode: "multi-tenant",
  },
  {
    invitationId: "invite-supplier-sh-removed",
    workspaceId: "workspace-supplier-shuhua",
    email: "removed@shuhua.cn",
    role: "role-supplier-admin",
    status: "removed",
    mode: "multi-tenant",
  },
  {
    invitationId: "invite-tender-sh-admin",
    workspaceId: "workspace-tender-owner-sh-gym",
    email: "tender.admin@sh-gym.cn",
    role: "role-tender-owner-admin",
    status: "active",
    mode: "multi-tenant",
  },
  {
    invitationId: "invite-tender-sh-publisher",
    workspaceId: "workspace-tender-owner-sh-gym",
    email: "tender.publisher@sh-gym.cn",
    role: "role-tender-owner-publisher",
    status: "active",
    mode: "multi-tenant",
  },
  {
    invitationId: "invite-tender-bj-accepted",
    workspaceId: "workspace-tender-owner-bj-hotel",
    email: "accepted@bj-hotel.cn",
    role: "role-tender-owner-admin",
    status: "accepted",
    mode: "multi-tenant",
  },
  {
    invitationId: "invite-tender-gz-pending",
    workspaceId: "workspace-tender-owner-gz-campus",
    email: "pending@gz-campus.cn",
    role: "role-tender-owner-publisher",
    status: "pending",
    mode: "multi-tenant",
  },
];

export function getAllMembershipInvitations(): MembershipInvitation[] {
  return [...MEMBERSHIP_INVITATIONS];
}

export function getMembershipInvitationById(
  invitationId: string,
): MembershipInvitation | undefined {
  return MEMBERSHIP_INVITATIONS.find((invitation) => invitation.invitationId === invitationId);
}

export function getMembershipInvitationsByWorkspaceId(
  workspaceId: string,
): MembershipInvitation[] {
  return MEMBERSHIP_INVITATIONS.filter((invitation) => invitation.workspaceId === workspaceId);
}
