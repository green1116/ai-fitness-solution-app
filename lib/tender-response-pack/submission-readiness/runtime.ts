import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ResponsePackRuntimeResult, ResponsePackStageResult } from "../shared/types";
import { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";
import { buildAllSubmissionReadinessAssessments } from "./builders";
import type { SubmissionReadinessRuntimePayload } from "./types";
import { SUBMISSION_READINESS_RUNTIME_VERSION } from "./types";

export function validateSubmissionReadinessRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const { assessments, averageSubmissionReadinessScore } = buildAllSubmissionReadinessAssessments(input);
  return {
    valid:
      assessments.length === 4 &&
      averageSubmissionReadinessScore >= 95 &&
      assessments.every((a) => a.completeness >= 85),
  };
}

export function runSubmissionReadinessRuntime(input?: {
  deploymentId?: string;
}): ResponsePackRuntimeResult<SubmissionReadinessRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "submission-readiness-default";
  const stages: ResponsePackStageResult[] = [];

  const result = runStage("submission-readiness-build", "Submission Readiness", () => buildAllSubmissionReadinessAssessments(input), stages);
  const validation = runStage("submission-readiness-validate", "Submission Validation", () => validateSubmissionReadinessRuntime(input), stages);
  if (!validation.valid) throw new Error("Submission readiness validation failed");

  const payload: SubmissionReadinessRuntimePayload = {
    version: SUBMISSION_READINESS_RUNTIME_VERSION,
    packVersion: TENDER_RESPONSE_PACK_VERSION,
    assessments: result.assessments,
    averageSubmissionReadinessScore: result.averageSubmissionReadinessScore,
    summary: `submission-readiness avg=${result.averageSubmissionReadinessScore}%`,
  };

  return finalizeRuntime({ domain: "submission-readiness", deploymentId, stages, payload, summary: payload.summary });
}
