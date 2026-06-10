import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AutopilotRuntimeResult,
  AutopilotStageResult,
} from "../shared/types";
import { AUTOPILOT_VERSION } from "../shared/types";
import { buildReviewGates, summarizeReviewGates } from "./builders";
import type { HumanReviewRuntimePayload } from "./types";
import { HUMAN_REVIEW_RUNTIME_VERSION } from "./types";

export function validateHumanReviewRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const gates = buildReviewGates(input);
  const summary = summarizeReviewGates(gates);
  return {
    valid:
      gates.length === 8 &&
      summary.autoApprovedCount > 0 &&
      summary.manualReviewCount + summary.reviewRequiredCount > 0,
  };
}

export function runHumanReviewRuntime(input?: {
  deploymentId?: string;
}): AutopilotRuntimeResult<HumanReviewRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "review-default";
  const stages: AutopilotStageResult[] = [];

  const gates = runStage(
    "human-review-gates",
    "Review Gates",
    () => buildReviewGates({ deploymentId }),
    stages,
  );
  const counts = runStage(
    "human-review-summarize",
    "Review Summary",
    () => summarizeReviewGates(gates),
    stages,
  );
  const validation = runStage(
    "human-review-validate",
    "Review Validation",
    () => validateHumanReviewRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Human review validation failed");

  const payload: HumanReviewRuntimePayload = {
    version: HUMAN_REVIEW_RUNTIME_VERSION,
    autopilotVersion: AUTOPILOT_VERSION,
    gates,
    autoApprovedCount: counts.autoApprovedCount,
    manualReviewCount: counts.manualReviewCount,
    reviewRequiredCount: counts.reviewRequiredCount,
    summary: `human-review auto=${counts.autoApprovedCount} manual=${counts.manualReviewCount} required=${counts.reviewRequiredCount}`,
  };

  return finalizeRuntime({
    domain: "human-review",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
