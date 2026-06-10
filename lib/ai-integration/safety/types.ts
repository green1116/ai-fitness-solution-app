import type { AI_INTEGRATION_VERSION } from "../shared/types";

export const AI_SAFETY_RUNTIME_VERSION = "v13.0-ai-safety-1" as const;

export interface SafetyCheckResult {
  checkId: string;
  checkType:
    | "input-sanitization"
    | "output-validation"
    | "refusal-handling"
    | "unsafe-content-guard"
    | "prompt-injection-guard";
  passed: boolean;
  message: string;
}

export interface SafetyRuntimePayload {
  version: typeof AI_SAFETY_RUNTIME_VERSION;
  integrationVersion: typeof AI_INTEGRATION_VERSION;
  checks: SafetyCheckResult[];
  allPassed: boolean;
  summary: string;
}
