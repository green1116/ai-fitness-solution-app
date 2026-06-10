import type { AutopilotJob, JobLifecycleStage, JobStatus, JobType } from "./types";
import { JOB_LIFECYCLE_STAGES, JOB_STATUSES, JOB_TYPES } from "./types";

const LIFECYCLE_BY_STATUS: Record<JobStatus, JobLifecycleStage> = {
  pending: "created",
  queued: "queued",
  running: "executing",
  reviewing: "reviewing",
  delivering: "delivering",
  completed: "completed",
  failed: "executing",
  cancelled: "created",
};

export function buildAutopilotJob(input?: {
  deploymentId?: string;
  jobType?: JobType;
  status?: JobStatus;
}): AutopilotJob {
  const deploymentId = input?.deploymentId ?? "job-default";
  const jobType = input?.jobType ?? "full-delivery";
  const status = input?.status ?? "running";
  const now = new Date().toISOString();

  return {
    jobId: `autopilot-job-${deploymentId}`,
    jobType,
    status,
    lifecycleStage: LIFECYCLE_BY_STATUS[status],
    projectName: "政府健身中心健身器材采购项目",
    createdAt: now,
    updatedAt: now,
    mode: "readiness-stub",
  };
}

