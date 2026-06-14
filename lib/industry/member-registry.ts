import type { Member, OrganizationMember, RegistryValidation } from "./shared/types";
import { getOrganizationById } from "./organization-registry";
import { getRoleById } from "./role-registry";

export const MEMBER_REGISTRY: Member[] = [
  {
    memberId: "ind-member-lf-admin",
    email: "admin@lifefitness.cn",
    phone: "+86-21-6000-1001",
    displayName: "Life Fitness Admin",
    status: "active",
    mode: "industry-platform",
  },
  {
    memberId: "ind-member-lf-editor",
    email: "editor@lifefitness.cn",
    phone: "+86-21-6000-1002",
    displayName: "Life Fitness Editor",
    status: "active",
    mode: "industry-platform",
  },
  {
    memberId: "ind-member-supplier-lf-admin",
    email: "supplier.admin@lifefitness.cn",
    phone: "+86-21-6000-2001",
    displayName: "LF Supplier Admin",
    status: "active",
    mode: "industry-platform",
  },
  {
    memberId: "ind-member-buyer-sh-admin",
    email: "buyer.admin@sh-gym.cn",
    phone: "+86-21-6000-3001",
    displayName: "Shanghai Gym Buyer Admin",
    status: "active",
    mode: "industry-platform",
  },
  {
    memberId: "ind-member-consultant-lead",
    email: "lead@fitness-advisory.cn",
    phone: "+86-21-6000-4001",
    displayName: "Advisory Lead Consultant",
    status: "active",
    mode: "industry-platform",
  },
  {
    memberId: "ind-member-operator-lead",
    email: "ops@industry-platform.cn",
    phone: "+86-21-6000-5001",
    displayName: "Platform Operator Lead",
    status: "active",
    mode: "industry-platform",
  },
  {
    memberId: "ind-member-association-secretary",
    email: "secretary@china-fitness-assoc.cn",
    phone: "+86-21-6000-6001",
    displayName: "Association Secretary",
    status: "active",
    mode: "industry-platform",
  },
  {
    memberId: "ind-member-cross-org",
    email: "cross.org@industry-platform.cn",
    phone: "+86-21-6000-7001",
    displayName: "Cross Organization Member",
    status: "active",
    mode: "industry-platform",
  },
];

export const ORGANIZATION_MEMBER_REGISTRY: OrganizationMember[] = [
  {
    organizationMemberId: "ind-org-member-lf-admin",
    organizationId: "ind-org-brand-life-fitness",
    memberId: "ind-member-lf-admin",
    roleIds: ["ind-role-brand-admin"],
    joinedAt: "2026-02-01T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    organizationMemberId: "ind-org-member-lf-editor",
    organizationId: "ind-org-brand-life-fitness",
    memberId: "ind-member-lf-editor",
    roleIds: ["ind-role-brand-admin"],
    joinedAt: "2026-02-02T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    organizationMemberId: "ind-org-member-supplier-lf",
    organizationId: "ind-org-supplier-life-fitness-cn",
    memberId: "ind-member-supplier-lf-admin",
    roleIds: ["ind-role-supplier-admin"],
    joinedAt: "2026-02-03T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    organizationMemberId: "ind-org-member-buyer-sh",
    organizationId: "ind-org-buyer-sh-gym",
    memberId: "ind-member-buyer-sh-admin",
    roleIds: ["ind-role-buyer-admin", "ind-role-bid-manager"],
    joinedAt: "2026-02-04T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    organizationMemberId: "ind-org-member-consultant",
    organizationId: "ind-org-consultant-fitness-advisory",
    memberId: "ind-member-consultant-lead",
    roleIds: ["ind-role-consultant"],
    joinedAt: "2026-02-05T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    organizationMemberId: "ind-org-member-operator",
    organizationId: "ind-org-operator-platform-ops",
    memberId: "ind-member-operator-lead",
    roleIds: ["ind-role-operator"],
    joinedAt: "2026-02-06T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    organizationMemberId: "ind-org-member-association",
    organizationId: "ind-org-association-china-fitness",
    memberId: "ind-member-association-secretary",
    roleIds: ["ind-role-proposal-reviewer"],
    joinedAt: "2026-02-07T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    organizationMemberId: "ind-org-member-cross-brand",
    organizationId: "ind-org-brand-technogym",
    memberId: "ind-member-cross-org",
    roleIds: ["ind-role-brand-admin"],
    joinedAt: "2026-02-08T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    organizationMemberId: "ind-org-member-cross-supplier",
    organizationId: "ind-org-supplier-technogym-cn",
    memberId: "ind-member-cross-org",
    roleIds: ["ind-role-supplier-admin"],
    joinedAt: "2026-02-09T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
  {
    organizationMemberId: "ind-org-member-cross-buyer",
    organizationId: "ind-org-buyer-bj-hotel",
    memberId: "ind-member-cross-org",
    roleIds: ["ind-role-buyer-admin"],
    joinedAt: "2026-02-10T00:00:00.000Z",
    status: "active",
    mode: "industry-platform",
  },
];

export function getAllMembers(): Member[] {
  return [...MEMBER_REGISTRY];
}

export function getMemberById(memberId: string): Member | undefined {
  return MEMBER_REGISTRY.find((member) => member.memberId === memberId);
}

export function getAllOrganizationMembers(): OrganizationMember[] {
  return [...ORGANIZATION_MEMBER_REGISTRY];
}

export function getOrganizationMembersByOrganizationId(
  organizationId: string,
): OrganizationMember[] {
  return ORGANIZATION_MEMBER_REGISTRY.filter((entry) => entry.organizationId === organizationId);
}

export function getOrganizationMembersByMemberId(memberId: string): OrganizationMember[] {
  return ORGANIZATION_MEMBER_REGISTRY.filter((entry) => entry.memberId === memberId);
}

export function getOrganizationMemberLink(
  organizationId: string,
  memberId: string,
): OrganizationMember | undefined {
  return ORGANIZATION_MEMBER_REGISTRY.find(
    (entry) => entry.organizationId === organizationId && entry.memberId === memberId,
  );
}

export function validateMemberRegistry(): RegistryValidation {
  const members = getAllMembers();
  const organizationMembers = getAllOrganizationMembers();

  const memberFieldValid = members.every(
    (member) =>
      member.memberId.length > 0 &&
      member.email.length > 0 &&
      member.displayName.length > 0 &&
      member.status === "active" &&
      member.mode === "industry-platform",
  );

  const orgMemberFieldValid = organizationMembers.every(
    (entry) =>
      getOrganizationById(entry.organizationId) !== undefined &&
      getMemberById(entry.memberId) !== undefined &&
      entry.roleIds.length > 0 &&
      entry.roleIds.every((roleId) => getRoleById(roleId) !== undefined) &&
      entry.mode === "industry-platform",
  );

  const multiOrgMember = members.some(
    (member) => getOrganizationMembersByMemberId(member.memberId).length > 1,
  );

  const valid =
    members.length >= 8 &&
    organizationMembers.length >= 10 &&
    memberFieldValid &&
    orgMemberFieldValid &&
    multiOrgMember;

  return {
    valid,
    count: members.length,
    summary: `member-registry members=${members.length} orgMembers=${organizationMembers.length} multiOrg=${multiOrgMember} valid=${valid}`,
  };
}
