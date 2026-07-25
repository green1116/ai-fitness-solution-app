/**
 * Product Admin — Policy types
 */

import type {
  ADMIN_POLICY_EFFECTS,
  ADMIN_POLICY_STATUSES,
} from "../foundation/foundation.constants";

export type AdminPolicyEffect = (typeof ADMIN_POLICY_EFFECTS)[number];
export type AdminPolicyStatus = (typeof ADMIN_POLICY_STATUSES)[number];
export type PolicyMetadata = Record<string, unknown>;

export type AdminPolicy = {
  id: string;
  code: string;
  effect: AdminPolicyEffect;
  status: AdminPolicyStatus;
  settingId: string;
  tenantId: string;
  detail: string;
  metadata: PolicyMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAdminPolicyInput = {
  id?: string;
  code: string;
  effect: AdminPolicyEffect;
  settingId: string;
  tenantId: string;
  metadata?: PolicyMetadata;
};

export type EnforceAdminPolicyInput = {
  policyId: string;
};
