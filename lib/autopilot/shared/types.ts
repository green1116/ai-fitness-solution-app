export const AUTOPILOT_VERSION = "v13.5-autopilot-1" as const;

export type AutopilotStatus = "success" | "failed";

export type AutopilotStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export interface AutopilotStageResult {
  stageId: string;
  label: string;
  status: AutopilotStageStatus;
  durationMs: number;
  message: string;
}

export interface AutopilotRuntimeResult<TPayload> {
  version: typeof AUTOPILOT_VERSION;
  runtimeId: string;
  domain: string;
  status: AutopilotStatus;
  stages: AutopilotStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface AutopilotEvidence {
  evidenceId: string;
  version: typeof AUTOPILOT_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: AutopilotStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
