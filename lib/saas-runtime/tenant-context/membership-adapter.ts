import type { SaasPortalType } from "@/lib/saas-foundation/shared/types";
import { SAAS_CONTEXT_ERROR_CODES, SaasContextError } from "./context-errors";
import type { MembershipContextRecord } from "./context-types";

const MOCK_MEMBERSHIP: MembershipContextRecord = {
  id: "membership-mock-enterprise-owner",
  userId: "user-mock-enterprise-owner",
  tenantId: "tenant-mock-enterprise",
  organizationId: "org-mock-enterprise",
  workspaceId: "workspace-mock-enterprise",
  roleSystemCode: "enterprise_owner",
  portalType: "enterprise",
};

const MOCK_MEMBERSHIP_BY_USER: Record<string, MembershipContextRecord> = {
  [MOCK_MEMBERSHIP.userId]: MOCK_MEMBERSHIP,
  "user-mock-contractor-pm": {
    id: "membership-mock-contractor-pm",
    userId: "user-mock-contractor-pm",
    tenantId: "tenant-mock-contractor",
    organizationId: "org-mock-contractor",
    workspaceId: "workspace-mock-contractor",
    roleSystemCode: "contractor_pm",
    portalType: "contractor",
  },
};

let adapterMembership: MembershipContextRecord | null = null;

export function setMembershipAdapterRecord(record: MembershipContextRecord | null): void {
  adapterMembership = record;
}

export function clearMembershipAdapterRecord(): void {
  adapterMembership = null;
}

export function getMockMembership(userId: string): MembershipContextRecord | null {
  if (adapterMembership && adapterMembership.userId === userId) {
    return adapterMembership;
  }
  return MOCK_MEMBERSHIP_BY_USER[userId] ?? null;
}

export async function resolveMembershipFromAdapter(userId: string): Promise<MembershipContextRecord> {
  const membership = getMockMembership(userId);
  if (!membership) {
    throw new SaasContextError(
      SAAS_CONTEXT_ERROR_CODES.TENANT_CONTEXT_NOT_FOUND,
      `Membership not found for userId=${userId}`,
    );
  }
  return membership;
}

export function getDefaultMockMembershipUserId(): string {
  return MOCK_MEMBERSHIP.userId;
}

export function getDefaultMockPortalType(): SaasPortalType {
  return MOCK_MEMBERSHIP.portalType;
}
