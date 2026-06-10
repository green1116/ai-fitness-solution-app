import type { AUTOPILOT_VERSION, ReadinessStubMode } from "../shared/types";

export const AUTOPILOT_JOB_RUNTIME_VERSION = "v13.5-autopilot-job-1" as const;

export const JOB_TYPES = [
  "proposal-autopilot",
  "full-delivery",
  "tender-to-proposal",
] as const;

export type JobType = (typeof JOB_TYPES)[number];

export const JOB_STATUSES = [
  "pending",
  "queued",
  "running",
  "reviewing",
  "delivering",
  "completed",
  "failed",
  "cancelled",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export const JOB_LIFECYCLE_STAGES = [
  "created",
  "queued",
  "executing",
  "reviewing",
  "delivering",
  "completed",
] as const;

export type JobLifecycleStage = (typeof JOB_LIFECYCLE_STAGES)[number];

export interface AutopilotJob {
  jobId: string;
  jobType: JobType;
  status: JobStatus;
  lifecycleStage: JobLifecycleStage;
  projectName: string;
  createdAt: string;
  updatedAt: string;
  mode: ReadinessStubMode;
}

export interface AutopilotJobRuntimePayload {
  version: typeof AUTOPILOT_JOB_RUNTIME_VERSION;
  autopilotVersion: typeof AUTOPILOT_VERSION;
  job: AutopilotJob;
  supportedTypes: JobType[];
  summary: string;
}
