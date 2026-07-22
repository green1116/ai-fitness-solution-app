/**
 * Evolution P3 — Autonomous Customer Success types
 */

import type {
  AUTONOMOUS_CS_MANAGER_STATUSES,
  AUTONOMOUS_CS_READINESS_VERDICTS,
  CHURN_THREAT_LEVELS,
  CUSTOMER_INTELLIGENCE_MODES,
  ENGAGEMENT_CHANNELS,
  ENGAGEMENT_STATUSES,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_FREEZE_VERSION,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID,
  EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION,
  EXPANSION_OPPORTUNITY_LEVELS,
  SUCCESS_RECOMMENDATION_KINDS,
} from "./customer.constants";

export type CustomerIntelligenceMode =
  (typeof CUSTOMER_INTELLIGENCE_MODES)[number];
export type EngagementChannel = (typeof ENGAGEMENT_CHANNELS)[number];
export type EngagementStatus = (typeof ENGAGEMENT_STATUSES)[number];
export type SuccessRecommendationKind =
  (typeof SUCCESS_RECOMMENDATION_KINDS)[number];
export type ChurnThreatLevel = (typeof CHURN_THREAT_LEVELS)[number];
export type ExpansionOpportunityLevel =
  (typeof EXPANSION_OPPORTUNITY_LEVELS)[number];
export type AutonomousCsReadinessVerdict =
  (typeof AUTONOMOUS_CS_READINESS_VERDICTS)[number];
export type AutonomousCsManagerStatus =
  (typeof AUTONOMOUS_CS_MANAGER_STATUSES)[number];

export type AutonomousCsMetadata = Record<string, unknown>;

/** Customer intelligence model. */
export type CustomerIntelligenceProfile = {
  id: string;
  name: string;
  productId: string;
  customerHealthProfileId: string;
  predictionModelId?: string;
  customerRiskSignalId?: string;
  growthDashboardId?: string;
  commercialSlaId?: string;
  organizationId: string;
  productTenantId: string;
  mode: CustomerIntelligenceMode;
  intelligenceScore: number;
  detail: string;
  metadata: AutonomousCsMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateCustomerIntelligenceInput = {
  id?: string;
  name: string;
  productId: string;
  customerHealthProfileId: string;
  predictionModelId?: string;
  customerRiskSignalId?: string;
  growthDashboardId?: string;
  commercialSlaId?: string;
  mode?: CustomerIntelligenceMode;
  metadata?: AutonomousCsMetadata;
};

/** Engagement automation. */
export type EngagementAutomation = {
  id: string;
  customerIntelligenceId: string;
  channel: EngagementChannel;
  status: EngagementStatus;
  trigger: string;
  action: string;
  priority: number;
  detail: string;
  createdAt: string;
  completedAt?: string;
};

export type AutomateEngagementInput = {
  id?: string;
  customerIntelligenceId: string;
  channel?: EngagementChannel;
  trigger?: string;
  action?: string;
};

/** Success recommendation. */
export type SuccessRecommendation = {
  id: string;
  customerIntelligenceId: string;
  kind: SuccessRecommendationKind;
  title: string;
  action: string;
  expectedImpact: number;
  detail: string;
  createdAt: string;
};

export type GenerateSuccessRecommendationsInput = {
  idPrefix?: string;
  customerIntelligenceId: string;
};

/** Churn prevention. */
export type ChurnPreventionPlan = {
  id: string;
  customerIntelligenceId: string;
  threatLevel: ChurnThreatLevel;
  churnScore: number;
  interventions: string[];
  detail: string;
  plannedAt: string;
};

export type PlanChurnPreventionInput = {
  id?: string;
  customerIntelligenceId: string;
};

/** Expansion opportunity. */
export type ExpansionOpportunity = {
  id: string;
  customerIntelligenceId: string;
  level: ExpansionOpportunityLevel;
  opportunityScore: number;
  signals: string[];
  detail: string;
  detectedAt: string;
};

export type DetectExpansionOpportunityInput = {
  id?: string;
  customerIntelligenceId: string;
};

/** Readiness. */
export type AutonomousCsReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AutonomousCsReadinessResult = {
  customerIntelligenceId: string;
  verdict: AutonomousCsReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AutonomousCsReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AutonomousCsRegistryManifest = {
  autonomousCsId: typeof EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID;
  version: typeof EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION;
  freezeVersion: typeof EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_FREEZE_VERSION;
  base: typeof EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE;
  intelligenceCount: number;
  engagementCount: number;
  recommendationCount: number;
  churnPlanCount: number;
  expansionCount: number;
};
