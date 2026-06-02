export const REVENUE_OPERATIONS_VERSION = "v8.7-revenue-operations-1" as const;

export type PipelineStageKind =
  | "lead"
  | "qualified"
  | "proposal"
  | "trial"
  | "negotiation"
  | "won"
  | "lost";

export type ReportingPeriod = "monthly" | "quarterly" | "annual";

export interface PipelineStage {
  stageId: string;
  kind: PipelineStageKind;
  label: string;
  order: number;
}

export interface RevenueOpportunity {
  opportunityId: string;
  name: string;
  stage: PipelineStageKind;
  value: number;
  probability: number;
  expectedCloseAt: string;
}

export interface RevenueForecast {
  forecastId: string;
  bestCase: number;
  expectedCase: number;
  worstCase: number;
  currency: string;
  summary: string;
}

export interface RevenueMetrics {
  metricsId: string;
  pipelineValue: number;
  forecastRevenue: number;
  closedRevenue: number;
  expansionRevenue: number;
  renewalRevenue: number;
  arr: number;
  mrr: number;
  summary: string;
}

export interface RevenueReport {
  reportId: string;
  period: ReportingPeriod;
  pipelineValue: number;
  closedRevenue: number;
  forecastRevenue: number;
  arr: number;
  mrr: number;
  summary: string;
}

export interface RevenueSummary {
  summaryId: string;
  version: typeof REVENUE_OPERATIONS_VERSION;
  totalOpportunities: number;
  wonCount: number;
  lostCount: number;
  openPipelineValue: number;
  metrics: RevenueMetrics;
  summary: string;
}

export interface RevenueOperationsResponse {
  version: typeof REVENUE_OPERATIONS_VERSION;
  pipeline: RevenueOpportunity[];
  metrics: RevenueMetrics;
  forecast: RevenueForecast;
  report: RevenueReport;
  summary: RevenueSummary;
}
