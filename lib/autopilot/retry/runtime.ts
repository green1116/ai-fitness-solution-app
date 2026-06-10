import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AutopilotRuntimeResult,
  AutopilotStageResult,
} from "../shared/types";
import { AUTOPILOT_VERSION } from "../shared/types";
import { buildRetryPolicy, buildRetryRecords } from "./builders";
import type { RetryRuntimePayload } from "./types";
import { RETRY_RUNTIME_VERSION } from "./types";

export function validateRetryRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const policy = buildRetryPolicy(input);
  const records = buildRetryRecords(input);
  return {
    valid:
      policy.maxAttempts >= 3 &&
      records.some((r) => r.usedFallback) &&
      records.every((r) => r.attempt <= policy.maxAttempts),
  };
}

export function runRetryRuntime(input?: {
  deploymentId?: string;
}): AutopilotRuntimeResult<RetryRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "retry-default";
  const stages: AutopilotStageResult[] = [];

  const policy = runStage(
    "retry-policy",
    "Retry Policy",
    () => buildRetryPolicy({ deploymentId }),
    stages,
  );
  const records = runStage(
    "retry-records",
    "Retry Records",
    () => buildRetryRecords({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "retry-validate",
    "Retry Validation",
    () => validateRetryRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Retry runtime validation failed");

  const payload: RetryRuntimePayload = {
    version: RETRY_RUNTIME_VERSION,
    autopilotVersion: AUTOPILOT_VERSION,
    policy,
    records,
    summary: `retry-runtime maxAttempts=${policy.maxAttempts} records=${records.length} fallback=${policy.fallbackRoute}`,
  };

  return finalizeRuntime({
    domain: "retry-runtime",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
