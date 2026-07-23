/**
 * Launch L4 — Validation types
 */

import type { VALIDATION_CHECK_RESULTS } from "../scenario/scenario.constants";

export type ValidationCheckResult =
  (typeof VALIDATION_CHECK_RESULTS)[number];
export type ValidationMetadata = Record<string, unknown>;

export type ValidationCheck = {
  id: string;
  scenarioId: string;
  name: string;
  component: string;
  result: ValidationCheckResult;
  weight: number;
  detail: string;
  metadata: ValidationMetadata;
  checkedAt: string;
};

export type RunValidationCheckInput = {
  id?: string;
  scenarioId: string;
  name: string;
  component: string;
  result: ValidationCheckResult;
  weight?: number;
  metadata?: ValidationMetadata;
};

export type ValidationResult = {
  id: string;
  scenarioId: string;
  score: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  verdict: "PASS" | "WARN" | "FAIL";
  detail: string;
  evaluatedAt: string;
};

export type EvaluateValidationResultInput = {
  id?: string;
  scenarioId: string;
};
