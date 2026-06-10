export const TENDER_INTELLIGENCE_VERSION = "v12.0-tender-intelligence-1" as const;

export type TenderIntelligenceStatus = "success" | "failed";

export type TenderIntelligenceStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export interface TenderIntelligenceStageResult {
  stageId: string;
  label: string;
  status: TenderIntelligenceStageStatus;
  durationMs: number;
  message: string;
}

export interface TenderIntelligenceRuntimeResult<TPayload> {
  version: typeof TENDER_INTELLIGENCE_VERSION;
  runtimeId: string;
  domain: string;
  status: TenderIntelligenceStatus;
  stages: TenderIntelligenceStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface TenderIntelligenceEvidence {
  evidenceId: string;
  version: typeof TENDER_INTELLIGENCE_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: TenderIntelligenceStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
