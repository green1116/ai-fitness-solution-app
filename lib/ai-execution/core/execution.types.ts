/**
 * V62 P2 — AI Execution Layer types
 */

export type ExecutionActionType = "GROWTH" | "SALES" | "PRICING" | "CRM" | "SYSTEM";

export type ExecutionPriority = "LOW" | "MEDIUM" | "HIGH";

export type ExecutionTargetSystem = "V60" | "V61" | "V59";

export interface ExecutionAction {
  id: string;
  type: ExecutionActionType;
  priority: ExecutionPriority;
  payload: unknown;
  targetSystem: ExecutionTargetSystem;
  organizationId: string;
  label?: string;
  reversible?: boolean;
  sourceRule?: string;
}

export type ExecutionStatus = "pending" | "validated" | "executed" | "skipped" | "failed" | "reversed";

export type ExecutionResult = {
  actionId: string;
  type: ExecutionActionType;
  status: ExecutionStatus;
  message: string;
  targetSystem: ExecutionTargetSystem;
  delegatedTo?: string;
  traceId: string;
  reversible: boolean;
  executedAt: string;
  metricsSnapshot?: Record<string, number>;
};

export type ExecutionPlan = {
  organizationId: string;
  traceId: string;
  actions: ExecutionAction[];
  generatedAt: string;
  source: "decision_engine" | "automation_rules" | "trigger" | "manual";
};

export type ExecutionLogEntry = {
  id: string;
  traceId: string;
  organizationId: string;
  action: ExecutionAction;
  result: ExecutionResult;
  createdAt: string;
};

export type ExecutionMonitorReport = {
  total: number;
  executed: number;
  failed: number;
  skipped: number;
  reversed: number;
  recent: ExecutionLogEntry[];
};

export const EXECUTION_THRESHOLDS = {
  churnRateRetention: 10,
  activationRateLow: 50,
  leadScoreHot: 80,
  conversionRateLow: 5,
  demandHighMrr: 500,
} as const;
