import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  AutopilotRuntimeResult,
  AutopilotStageResult,
} from "../shared/types";
import { AUTOPILOT_VERSION } from "../shared/types";
import { buildAutopilotJob } from "./builders";
import type { AutopilotJobRuntimePayload } from "./types";
import { AUTOPILOT_JOB_RUNTIME_VERSION, JOB_TYPES } from "./types";

export function validateAutopilotJobRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const job = buildAutopilotJob(input);
  return {
    valid:
      JOB_TYPES.includes(job.jobType) &&
      job.jobId.length > 0 &&
      job.lifecycleStage.length > 0,
  };
}

export function runAutopilotJobRuntime(input?: {
  deploymentId?: string;
}): AutopilotRuntimeResult<AutopilotJobRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "job-default";
  const stages: AutopilotStageResult[] = [];

  const job = runStage(
    "autopilot-job-build",
    "Autopilot Job",
    () => buildAutopilotJob({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "autopilot-job-validate",
    "Job Validation",
    () => validateAutopilotJobRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Autopilot job validation failed");

  const payload: AutopilotJobRuntimePayload = {
    version: AUTOPILOT_JOB_RUNTIME_VERSION,
    autopilotVersion: AUTOPILOT_VERSION,
    job,
    supportedTypes: [...JOB_TYPES],
    summary: `autopilot-job id=${job.jobId} type=${job.jobType} status=${job.status} lifecycle=${job.lifecycleStage}`,
  };

  return finalizeRuntime({
    domain: "autopilot-job",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
