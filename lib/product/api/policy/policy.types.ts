/**
 * Product API — Policy types
 */

import type { API_POLICY_MODES } from "../management/management.constants";

export type ApiPolicyMode = (typeof API_POLICY_MODES)[number];
export type PolicyMetadata = Record<string, unknown>;

export type ApiPolicy = {
  id: string;
  apiId: string;
  mode: ApiPolicyMode;
  requireVersion: boolean;
  detail: string;
  metadata: PolicyMetadata;
  createdAt: string;
};

export type AttachApiPolicyInput = {
  id?: string;
  apiId: string;
  mode: ApiPolicyMode;
  requireVersion: boolean;
  metadata?: PolicyMetadata;
};
