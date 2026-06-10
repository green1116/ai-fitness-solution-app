export const GO_TO_MARKET_VERSION = "v17.0-go-to-market-1" as const;

export type GtmStatus = "success" | "failed";

export type GtmStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export interface GtmStageResult {
  stageId: string;
  label: string;
  status: GtmStageStatus;
  durationMs: number;
  message: string;
}

export interface GtmRuntimeResult<TPayload> {
  version: typeof GO_TO_MARKET_VERSION;
  runtimeId: string;
  domain: string;
  status: GtmStatus;
  stages: GtmStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface GtmEvidence {
  evidenceId: string;
  version: typeof GO_TO_MARKET_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: GtmStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
