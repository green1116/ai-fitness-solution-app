export const EXPANSION_RENEWAL_VERSION = "v8.9-expansion-renewal-1" as const;

export type ExpansionKind = "seat" | "workspace" | "feature" | "enterprise-upgrade";

export type ChurnRiskLevel = "low" | "medium" | "high";

export type CustomerHealthTrend = "improving" | "stable" | "declining";

export interface RenewalOpportunity {
  opportunityId: string;
  customerId: string;
  renewalProbability: number;
  renewalReadiness: number;
  renewalValue: number;
  renewalForecast: number;
  currency: string;
  summary: string;
}

export interface ExpansionOpportunity {
  opportunityId: string;
  customerId: string;
  kind: ExpansionKind;
  label: string;
  estimatedValue: number;
  probability: number;
  summary: string;
}

export interface RetentionProfile {
  profileId: string;
  customerId: string;
  retentionRate: number;
  churnRisk: ChurnRiskLevel;
  customerHealth: CustomerHealthTrend;
  engagementTrend: CustomerHealthTrend;
  summary: string;
}

export interface GrowthMetrics {
  metricsId: string;
  upsellPotential: number;
  crossSellPotential: number;
  expansionArr: number;
  renewalArr: number;
  currency: string;
  summary: string;
}

export interface ExpansionSummary {
  summaryId: string;
  version: typeof EXPANSION_RENEWAL_VERSION;
  customerId: string;
  renewalProbability: number;
  expansionOpportunityCount: number;
  retentionRate: number;
  expansionArr: number;
  summary: string;
}

export interface ExpansionRenewalResponse {
  version: typeof EXPANSION_RENEWAL_VERSION;
  renewal: RenewalOpportunity;
  expansion: ExpansionOpportunity[];
  retention: RetentionProfile;
  growth: GrowthMetrics;
  summary: ExpansionSummary;
}
