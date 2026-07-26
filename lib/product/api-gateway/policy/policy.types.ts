/**
 * Product API Gateway — request policy types
 */

import type { GATEWAY_POLICY_MODES } from "../management/management.constants";

export type GatewayPolicyMode = (typeof GATEWAY_POLICY_MODES)[number];
export type PolicyMetadata = Record<string, unknown>;

export type GatewayRequestPolicy = {
  id: string;
  gatewayId: string;
  routeId: string;
  mode: GatewayPolicyMode;
  requireCredential: boolean;
  detail: string;
  metadata: PolicyMetadata;
  createdAt: string;
};

export type AttachGatewayRequestPolicyInput = {
  id?: string;
  gatewayId: string;
  routeId: string;
  mode: GatewayPolicyMode;
  requireCredential: boolean;
  metadata?: PolicyMetadata;
};
