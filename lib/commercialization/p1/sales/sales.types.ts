/**
 * Commercialization P1 — Sales types
 */

import type {
  COMMERCIALIZATION_SALES_FOUNDATION_BASE,
  COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION,
  COMMERCIALIZATION_SALES_FOUNDATION_ID,
  COMMERCIALIZATION_SALES_FOUNDATION_VERSION,
  OPPORTUNITY_STATUSES,
  PIPELINE_STAGES,
  SALES_MANAGER_STATUSES,
  SALES_READINESS_VERDICTS,
} from "./sales.constants";

export type PipelineStage = (typeof PIPELINE_STAGES)[number];
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];
export type SalesReadinessVerdict =
  (typeof SALES_READINESS_VERDICTS)[number];
export type SalesManagerStatus = (typeof SALES_MANAGER_STATUSES)[number];

export type SalesMetadata = Record<string, unknown>;

export type SalesOpportunity = {
  id: string;
  name: string;
  customerId: string;
  offerId: string;
  amount: number;
  currency: string;
  stage: PipelineStage;
  status: OpportunityStatus;
  probability: number;
  owner: string;
  detail: string;
  metadata: SalesMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOpportunityInput = {
  id?: string;
  name: string;
  customerId: string;
  offerId: string;
  amount: number;
  currency?: string;
  stage?: PipelineStage;
  status?: OpportunityStatus;
  owner?: string;
  metadata?: SalesMetadata;
};

export type PipelineEntry = {
  id: string;
  opportunityId: string;
  stage: PipelineStage;
  previousStage?: PipelineStage;
  note: string;
  movedAt: string;
};

export type AdvancePipelineInput = {
  id?: string;
  opportunityId: string;
  stage: PipelineStage;
  note?: string;
};

export type SalesMetrics = {
  id: string;
  opportunityCount: number;
  openCount: number;
  wonCount: number;
  lostCount: number;
  pipelineValue: number;
  wonValue: number;
  winRate: number;
  averageDealSize: number;
  detail: string;
  computedAt: string;
};

export type ComputeSalesMetricsInput = {
  id?: string;
  customerId?: string;
};

export type SalesReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type SalesReadinessResult = {
  verdict: SalesReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: SalesReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type SalesRegistryManifest = {
  foundationId: typeof COMMERCIALIZATION_SALES_FOUNDATION_ID;
  version: typeof COMMERCIALIZATION_SALES_FOUNDATION_VERSION;
  freezeVersion: typeof COMMERCIALIZATION_SALES_FOUNDATION_FREEZE_VERSION;
  base: typeof COMMERCIALIZATION_SALES_FOUNDATION_BASE;
  opportunityCount: number;
  pipelineCount: number;
  metricsCount: number;
  customerCount: number;
  offerCount: number;
  pricingCount: number;
};
