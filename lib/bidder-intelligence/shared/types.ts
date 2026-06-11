export const BIDDER_INTELLIGENCE_VERSION = "v19.0-bidder-intelligence-1" as const;

export type BidderIntelligenceStatus = "success" | "failed";

export type BidderIntelligenceStageStatus = "completed" | "failed";

export type ReadinessStubMode = "readiness-stub";

export interface BidderIntelligenceStageResult {
  stageId: string;
  label: string;
  status: BidderIntelligenceStageStatus;
  durationMs: number;
  message: string;
}

export interface BidderIntelligenceRuntimeResult<TPayload> {
  version: typeof BIDDER_INTELLIGENCE_VERSION;
  runtimeId: string;
  domain: string;
  status: BidderIntelligenceStatus;
  stages: BidderIntelligenceStageResult[];
  payload: TPayload;
  evidenceId: string;
  summary: string;
  completedAt: string;
}

export interface BidderIntelligenceEvidence {
  evidenceId: string;
  version: typeof BIDDER_INTELLIGENCE_VERSION;
  domains: string[];
  runtimes: Array<{
    domain: string;
    runtimeId: string;
    status: BidderIntelligenceStatus;
    stageCount: number;
    summary: string;
  }>;
  generatedAt: string;
  summary: string;
}
