/**
 * V62 P1 — AI Decision Engine types
 */

export interface BusinessContext {
  mrr: number;
  arr: number;
  churnRate: number;
  conversionRate: number;
  leadCount: number;
  dealCount: number;
  activeUsers: number;
  revenue: number;
}

export interface DecisionOutput {
  insights: string[];
  recommendations: string[];
  actions: string[];
  priorityActions: string[];
  riskAlerts: string[];
}

export type DecisionPhase = "analysis" | "strategy" | "optimization" | "action";

export type DecisionActionType =
  | "retention_campaign"
  | "funnel_optimization"
  | "pricing_review"
  | "sales_automation"
  | "lead_scoring_adjustment"
  | "growth_experiment";

export type DecisionAction = {
  id: string;
  type: DecisionActionType;
  label: string;
  priority: "high" | "medium" | "low";
  organizationId: string;
  payload?: Record<string, unknown>;
};

export type DecisionActionResult = {
  actionId: string;
  type: DecisionActionType;
  status: "scheduled" | "delegated" | "skipped";
  message: string;
  delegatedTo?: string;
};

export type StrategyPlan = {
  growth: string[];
  pricing: string[];
  sales: string[];
};

export type BusinessAnalysis = {
  health: "strong" | "stable" | "at_risk" | "critical";
  bottlenecks: string[];
  revenueLeaks: string[];
  kpiSummary: string[];
};

export const DECISION_THRESHOLDS = {
  churnRateHigh: 15,
  conversionRateLow: 5,
  mrrStagnationDelta: 0,
  dealCountLow: 3,
  leadQualityLow: 40,
  opportunityDropRatio: 0.5,
} as const;

export type DecisionPipelineResult = {
  context: BusinessContext;
  analysis: BusinessAnalysis;
  strategy: StrategyPlan;
  output: DecisionOutput;
  actions: DecisionAction[];
  executed: DecisionActionResult[];
  generatedAt: string;
};
