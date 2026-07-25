/**
 * Product Session — Validation types
 */

import type { VALIDATION_RESULTS } from "../control/control.constants";

export type ValidationResult = (typeof VALIDATION_RESULTS)[number];
export type ValidationMetadata = Record<string, unknown>;

export type SessionValidation = {
  id: string;
  sessionId: string;
  tokenId?: string;
  result: ValidationResult;
  detail: string;
  metadata: ValidationMetadata;
  validatedAt: string;
};

export type ValidateSessionInput = {
  id?: string;
  sessionId: string;
  tokenId?: string;
  metadata?: ValidationMetadata;
};
