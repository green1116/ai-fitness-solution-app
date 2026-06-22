/**
 * V62 P3 — Autonomous Company state model
 */

import type { BusinessContext } from "@/lib/ai-decision/core/decision.types";
import type { BusinessAnalysis } from "@/lib/ai-decision/core/decision.types";
import type { StrategyPlan } from "@/lib/ai-decision/core/decision.types";

export type CompanyHealth = "thriving" | "stable" | "stressed" | "critical";

export type CompanyState = {
  organizationId: string;
  traceId: string;
  running: boolean;
  health: CompanyHealth;
  business: BusinessContext;
  analysis?: BusinessAnalysis;
  strategy?: StrategyPlan;
  cycleCount: number;
  lastCycleAt?: string;
  metrics: {
    mrr: number;
    arr: number;
    churnRate: number;
    conversionRate: number;
    revenue: number;
    activeUsers: number;
    errorRate: number;
    growthStagnant: boolean;
    revenueFlat: boolean;
    conversionDropping: boolean;
  };
};

export type CompanyCycleOutcome = {
  cycle: number;
  traceId: string;
  observed: CompanyState["metrics"];
  strategyGenerated: boolean;
  actionsExecuted: number;
  actionsFailed: number;
  optimizations: string[];
  selfHealingApplied: boolean;
  policiesEnforced: number;
  completedAt: string;
};

export type AutonomousCompanyReport = {
  organizationId: string;
  traceId: string;
  state: CompanyState;
  outcomes: CompanyCycleOutcome[];
  feedback: Record<string, number>;
  generatedAt: string;
};
