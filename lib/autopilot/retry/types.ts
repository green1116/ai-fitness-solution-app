import type { AUTOPILOT_VERSION } from "../shared/types";
import type { WorkflowStepId } from "../workflow/types";

export const RETRY_RUNTIME_VERSION = "v13.5-retry-runtime-1" as const;

export interface RetryPolicy {
  policyId: string;
  maxAttempts: number;
  backoffMs: number;
  fallbackRoute: string;
}

export interface RetryRecord {
  recordId: string;
  stepId: WorkflowStepId;
  attempt: number;
  maxAttempts: number;
  usedFallback: boolean;
  fallbackRoute: string;
  outcome: "success" | "failed" | "pending";
}

export interface RetryRuntimePayload {
  version: typeof RETRY_RUNTIME_VERSION;
  autopilotVersion: typeof AUTOPILOT_VERSION;
  policy: RetryPolicy;
  records: RetryRecord[];
  summary: string;
}
