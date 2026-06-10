import type { REVENUE_OPERATIONS_VERSION, ReadinessStubMode } from "../shared/types";

export const OPPORTUNITY_RUNTIME_VERSION = "v15.0-opportunity-runtime-1" as const;

export const PIPELINE_STAGES = ["discovery", "proposal", "negotiation", "won", "lost"] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export interface Opportunity {
  opportunityId: string;
  pipelineStage: PipelineStage;
  estimatedValueCny: number;
  closeProbability: number;
  accountName: string;
  mode: ReadinessStubMode;
}

export interface OpportunityRuntimePayload {
  version: typeof OPPORTUNITY_RUNTIME_VERSION;
  revOpsVersion: typeof REVENUE_OPERATIONS_VERSION;
  opportunities: Opportunity[];
  pipelineValueCny: number;
  summary: string;
}
