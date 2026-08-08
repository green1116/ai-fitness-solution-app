/**
 * V80 Pilot P18 — Enterprise decision support schema (read-only composition)
 */

export const ENTERPRISE_DECISION_VERSION = "v80-pilot-p18-decision-1";

export type DecisionHealthBand =
  | "healthy"
  | "watch"
  | "at_risk"
  | "critical";

export type DecisionPriorityLevel = "P0" | "P1" | "P2" | "P3";

export type ExecutiveScorecard = {
  overallHealth: number;
  readinessIndex: number;
  riskIndex: number;
  knowledgeLeverage: number;
  benchmarkScore: number;
  maturityLevel: string;
  band: DecisionHealthBand;
  strengths: string[];
  concerns: string[];
};

export type ProjectReadinessFactor = {
  id: string;
  label: string;
  score: number;
  note: string;
};

export type ProjectReadinessScore = {
  sessionId: string;
  label: string;
  status: string;
  score: number;
  band: DecisionHealthBand;
  factors: ProjectReadinessFactor[];
  recommendation: string;
};

export type DeliveryRiskDriver = {
  id: string;
  label: string;
  severity: "high" | "medium" | "low";
  detail: string;
};

export type DeliveryRiskScore = {
  sessionId: string;
  label: string;
  score: number;
  level: DecisionHealthBand;
  drivers: DeliveryRiskDriver[];
};

export type DecisionRecommendationItem = {
  id: string;
  priority: DecisionPriorityLevel;
  title: string;
  action: string;
  source: string;
  impactScore: number;
};

export type InvestmentPriorityItem = {
  id: string;
  title: string;
  category: string;
  priorityScore: number;
  rationale: string;
  expectedLeverage: string;
};

export type DecisionNarrative = {
  headline: string;
  summary: string;
  nextSteps: string[];
};

export type EnterpriseDecisionReport = {
  version: typeof ENTERPRISE_DECISION_VERSION;
  organizationId: string;
  generatedAt: string;
  contentHash: string;
  executiveScorecard: ExecutiveScorecard;
  projectReadiness: ProjectReadinessScore[];
  deliveryRisks: DeliveryRiskScore[];
  recommendations: DecisionRecommendationItem[];
  investmentPriorities: InvestmentPriorityItem[];
  narrative: DecisionNarrative;
  sources: {
    sessionCount: number;
    benchmarkScore: number;
    maturityLevel: string;
    knowledgePatterns: number;
    similarPairCount: number;
    improvementSuggestions: number;
    recommendationAcceptRate: number;
  };
};
