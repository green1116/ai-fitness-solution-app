export const REVENUE_OPERATIONS_VERSION = "v15.0-revenue-operations-1" as const;

export type RevOpsStatus = "success" | "failed";

export type RevOpsStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export interface RevOpsStageResult {
  stageId: string;
  label: string;
  status: RevOpsStageStatus;
  durationMs: number;
  message: string;
}

export interface RevOpsRuntimeResult<TPayload> {
  version: typeof REVENUE_OPERATIONS_VERSION;
  runtimeId: string;
  domain: string;
  status: RevOpsStatus;
  stages: RevOpsStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface RevOpsEvidence {
  evidenceId: string;
  version: typeof REVENUE_OPERATIONS_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: RevOpsStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
