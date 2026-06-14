export const INDUSTRY_PLATFORM_VERSION = "v30-industry-platform-2" as const;
export const INDUSTRY_PLATFORM_TAG = "v30-industry-identity-layer" as const;

export type IndustryPlatformDataMode = "industry-platform";

export type IndustryEntityStatus = "active" | "inactive" | "draft" | "suspended";

export type IndustryOrganizationType =
  | "brand"
  | "supplier"
  | "buyer"
  | "consultant"
  | "operator"
  | "association";

export interface Organization {
  organizationId: string;
  organizationType: IndustryOrganizationType;
  organizationName: string;
  status: IndustryEntityStatus;
  createdAt: string;
  metadata: Record<string, string>;
  mode: IndustryPlatformDataMode;
}

export interface Member {
  memberId: string;
  email: string;
  phone: string;
  displayName: string;
  status: IndustryEntityStatus;
  mode: IndustryPlatformDataMode;
}

export interface OrganizationMember {
  organizationMemberId: string;
  organizationId: string;
  memberId: string;
  roleIds: string[];
  joinedAt: string;
  status: IndustryEntityStatus;
  mode: IndustryPlatformDataMode;
}

export type IndustryRoleType =
  | "brand-admin"
  | "supplier-admin"
  | "buyer-admin"
  | "consultant"
  | "bid-manager"
  | "proposal-reviewer"
  | "operator";

export interface Role {
  roleId: string;
  roleName: string;
  roleType: IndustryRoleType;
  description: string;
  permissionIds: string[];
  mode: IndustryPlatformDataMode;
}

export interface Permission {
  permissionId: string;
  permissionCode: string;
  permissionName: string;
  description: string;
  mode: IndustryPlatformDataMode;
}

export interface IndustryIdentityContext {
  contextId: string;
  organization: Organization;
  member: Member;
  organizationMember: OrganizationMember;
  roles: Role[];
  permissions: Permission[];
  mode: IndustryPlatformDataMode;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryPlatformValidation {
  valid: boolean;
  organizationRegistry: RegistryValidation;
  memberRegistry: RegistryValidation;
  roleRegistry: RegistryValidation;
  permissionRegistry: RegistryValidation;
  identityContext: RegistryValidation;
}

export const CANONICAL_INDUSTRY_IDENTITY_QUERY = {
  organizationId: "ind-org-brand-life-fitness",
  memberId: "ind-member-lf-admin",
} as const;
