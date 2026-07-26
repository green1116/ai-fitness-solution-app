/**
 * Product API Authentication — Token validation types
 */

import type { API_TOKEN_VALIDATION_VERDICTS } from "../management/management.constants";

export type ApiTokenValidationVerdict =
  (typeof API_TOKEN_VALIDATION_VERDICTS)[number];
export type TokenMetadata = Record<string, unknown>;

export type ApiTokenValidation = {
  id: string;
  credentialId: string;
  keyId: string;
  tokenFingerprint: string;
  verdict: ApiTokenValidationVerdict;
  detail: string;
  metadata: TokenMetadata;
  createdAt: string;
};

export type ValidateApiTokenInput = {
  id?: string;
  credentialId: string;
  keyId: string;
  presentedSecret: string;
  metadata?: TokenMetadata;
};
