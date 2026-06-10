export const CUSTOMER_SUCCESS_VERSION = "v16.0-customer-success-1" as const;

export type CustomerSuccessStatus = "success" | "failed";

export type CustomerSuccessStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export interface CustomerSuccessStageResult {
  stageId: string;
  label: string;
  status: CustomerSuccessStageStatus;
  durationMs: number;
  message: string;
}

export interface CustomerSuccessRuntimeResult<TPayload> {
  version: typeof CUSTOMER_SUCCESS_VERSION;
  runtimeId: string;
  domain: string;
  status: CustomerSuccessStatus;
  stages: CustomerSuccessStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface CustomerSuccessEvidence {
  evidenceId: string;
  version: typeof CUSTOMER_SUCCESS_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: CustomerSuccessStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
