import type { ENTERPRISE_SAAS_VERSION } from "../shared/types";

export const USER_RUNTIME_VERSION = "v10.5-user-runtime-1" as const;

export type UserStatus = "invited" | "active" | "suspended" | "deactivated";

export interface UserProfile {
  userId: string;
  tenantId: string;
  email: string;
  displayName: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface UserMembership {
  membershipId: string;
  userId: string;
  workspaceId: string;
  roleId: string;
  joinedAt: string;
  status: "active" | "pending" | "removed";
}

export interface UserRuntimePayload {
  version: typeof USER_RUNTIME_VERSION;
  saasVersion: typeof ENTERPRISE_SAAS_VERSION;
  profiles: UserProfile[];
  memberships: UserMembership[];
  summary: string;
}
