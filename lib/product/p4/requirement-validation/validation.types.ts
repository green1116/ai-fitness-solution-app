/**
 * Product P4 — Requirement validation types
 */

import type { VALIDATION_VERDICTS } from "../questionnaire/questionnaire.constants";

export type ValidationVerdict = (typeof VALIDATION_VERDICTS)[number];
export type ValidationMetadata = Record<string, unknown>;

export type RequirementValidation = {
  id: string;
  projectRef: string;
  verdict: ValidationVerdict;
  score: number;
  issues: string[];
  detail: string;
  metadata: ValidationMetadata;
  validatedAt: string;
};

export type ValidateRequirementsInput = {
  id?: string;
  projectRef: string;
  metadata?: ValidationMetadata;
};
