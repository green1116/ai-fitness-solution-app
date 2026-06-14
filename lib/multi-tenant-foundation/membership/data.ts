import type { Membership } from "../shared/types";

export const MEMBERSHIPS: Membership[] = [
  {
    membershipId: "membership-brand-lf-admin",
    workspaceId: "workspace-brand-life-fitness",
    memberId: "member-brand-lf-001",
    roleId: "role-brand-admin",
    status: "active",
    mode: "multi-tenant",
  },
  {
    membershipId: "membership-brand-lf-editor",
    workspaceId: "workspace-brand-life-fitness",
    memberId: "member-brand-lf-002",
    roleId: "role-brand-editor",
    status: "active",
    mode: "multi-tenant",
  },
  {
    membershipId: "membership-brand-tg-admin",
    workspaceId: "workspace-brand-technogym",
    memberId: "member-brand-tg-001",
    roleId: "role-brand-admin",
    status: "active",
    mode: "multi-tenant",
  },
  {
    membershipId: "membership-brand-mx-admin",
    workspaceId: "workspace-brand-matrix",
    memberId: "member-brand-mx-001",
    roleId: "role-brand-admin",
    status: "active",
    mode: "multi-tenant",
  },
  {
    membershipId: "membership-supplier-lf-admin",
    workspaceId: "workspace-supplier-life-fitness-cn",
    memberId: "member-supplier-lf-001",
    roleId: "role-supplier-admin",
    status: "active",
    mode: "multi-tenant",
  },
  {
    membershipId: "membership-supplier-lf-editor",
    workspaceId: "workspace-supplier-life-fitness-cn",
    memberId: "member-supplier-lf-002",
    roleId: "role-supplier-editor",
    status: "active",
    mode: "multi-tenant",
  },
  {
    membershipId: "membership-supplier-tg-admin",
    workspaceId: "workspace-supplier-technogym-cn",
    memberId: "member-supplier-tg-001",
    roleId: "role-supplier-admin",
    status: "active",
    mode: "multi-tenant",
  },
  {
    membershipId: "membership-supplier-mx-admin",
    workspaceId: "workspace-supplier-matrix-cn",
    memberId: "member-supplier-mx-001",
    roleId: "role-supplier-admin",
    status: "active",
    mode: "multi-tenant",
  },
  {
    membershipId: "membership-supplier-sh-admin",
    workspaceId: "workspace-supplier-shuhua",
    memberId: "member-supplier-sh-001",
    roleId: "role-supplier-admin",
    status: "active",
    mode: "multi-tenant",
  },
  {
    membershipId: "membership-tender-sh-admin",
    workspaceId: "workspace-tender-owner-sh-gym",
    memberId: "member-tender-sh-001",
    roleId: "role-tender-owner-admin",
    status: "active",
    mode: "multi-tenant",
  },
  {
    membershipId: "membership-tender-sh-publisher",
    workspaceId: "workspace-tender-owner-sh-gym",
    memberId: "member-tender-sh-002",
    roleId: "role-tender-owner-publisher",
    status: "active",
    mode: "multi-tenant",
  },
  {
    membershipId: "membership-tender-bj-admin",
    workspaceId: "workspace-tender-owner-bj-hotel",
    memberId: "member-tender-bj-001",
    roleId: "role-tender-owner-admin",
    status: "active",
    mode: "multi-tenant",
  },
  {
    membershipId: "membership-tender-gz-admin",
    workspaceId: "workspace-tender-owner-gz-campus",
    memberId: "member-tender-gz-001",
    roleId: "role-tender-owner-admin",
    status: "active",
    mode: "multi-tenant",
  },
];

export function getAllMemberships(): Membership[] {
  return [...MEMBERSHIPS];
}

export function getMembershipById(membershipId: string): Membership | undefined {
  return MEMBERSHIPS.find((m) => m.membershipId === membershipId);
}

export function getMembershipsByWorkspaceId(workspaceId: string): Membership[] {
  return MEMBERSHIPS.filter((m) => m.workspaceId === workspaceId);
}
