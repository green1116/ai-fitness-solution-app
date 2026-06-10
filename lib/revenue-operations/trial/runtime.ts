import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevOpsRuntimeResult, RevOpsStageResult } from "../shared/types";
import { REVENUE_OPERATIONS_VERSION } from "../shared/types";
import { buildTrialRecords } from "./builders";
import type { TrialOperationsRuntimePayload } from "./types";
import { TRIAL_OPERATIONS_RUNTIME_VERSION } from "./types";

export function validateTrialOperationsRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const trials = buildTrialRecords(input);
  return { valid: trials.length >= 2 && trials.some((t) => t.outcome === "active") };
}

export function runTrialOperationsRuntime(input?: {
  deploymentId?: string;
}): RevOpsRuntimeResult<TrialOperationsRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "trial-default";
  const stages: RevOpsStageResult[] = [];

  const trials = runStage("trial-build", "Trial Records", () => buildTrialRecords({ deploymentId }), stages);
  const validation = runStage("trial-validate", "Trial Validation", () => validateTrialOperationsRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Trial operations validation failed");

  const payload: TrialOperationsRuntimePayload = {
    version: TRIAL_OPERATIONS_RUNTIME_VERSION,
    revOpsVersion: REVENUE_OPERATIONS_VERSION,
    trials,
    activeCount: trials.filter((t) => t.outcome === "active").length,
    convertedCount: trials.filter((t) => t.outcome === "converted").length,
    summary: `trial-operations active=${trials.filter((t) => t.outcome === "active").length} converted=${trials.filter((t) => t.outcome === "converted").length}`,
  };

  return finalizeRuntime({ domain: "trial-operations", deploymentId, stages, payload, summary: payload.summary });
}
