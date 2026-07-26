/**
 * Product API Gateway — request validation types
 */

import type {
  GATEWAY_HTTP_METHODS,
  GATEWAY_VALIDATION_VERDICTS,
} from "../management/management.constants";

export type GatewayHttpMethod = (typeof GATEWAY_HTTP_METHODS)[number];
export type GatewayValidationVerdict =
  (typeof GATEWAY_VALIDATION_VERDICTS)[number];
export type ValidationMetadata = Record<string, unknown>;

export type GatewayRequestValidation = {
  id: string;
  gatewayId: string;
  method: GatewayHttpMethod;
  path: string;
  routeId?: string;
  policyId?: string;
  credentialRef?: string;
  verdict: GatewayValidationVerdict;
  detail: string;
  metadata: ValidationMetadata;
  createdAt: string;
};

export type ValidateGatewayRequestInput = {
  id?: string;
  gatewayId: string;
  method: GatewayHttpMethod;
  path: string;
  credentialRef?: string;
  metadata?: ValidationMetadata;
};
