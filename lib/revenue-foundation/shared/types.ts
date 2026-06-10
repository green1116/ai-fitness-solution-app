export const REVENUE_FOUNDATION_VERSION = "v10.0-revenue-foundation-1" as const;

export type RevenueRuntimeStatus = "success" | "failed";

export type RevenueStageStatus = "completed" | "failed";

export interface RevenueStageResult {
  stageId: string;
  label: string;
  status: RevenueStageStatus;
  durationMs: number;
  message: string;
}

export interface RevenueRuntimeResult<TPayload> {
  version: typeof REVENUE_FOUNDATION_VERSION;
  runtimeId: string;
  domain: string;
  status: RevenueRuntimeStatus;
  stages: RevenueStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface RevenueFoundationEvidence {
  evidenceId: string;
  version: typeof REVENUE_FOUNDATION_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: RevenueRuntimeStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
