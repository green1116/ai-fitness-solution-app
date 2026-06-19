import { SAAS_MEMBERSHIP_STATUSES } from "../shared/constants";

export function isValidMembershipStatus(status: string): boolean {
  return (SAAS_MEMBERSHIP_STATUSES as readonly string[]).includes(status);
}

export function assertMembershipOrganizationMatch(
  membershipOrganizationId: string,
  workspaceOrganizationId: string,
): boolean {
  return membershipOrganizationId === workspaceOrganizationId;
}
