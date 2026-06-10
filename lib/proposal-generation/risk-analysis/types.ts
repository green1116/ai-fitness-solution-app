import type { PROPOSAL_GENERATION_VERSION } from "../shared/types";

export const RISK_ANALYSIS_RUNTIME_VERSION = "v11.0-risk-analysis-runtime-1" as const;

export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type RiskLikelihood = "unlikely" | "possible" | "likely";

export interface RiskRegisterEntry {
  riskId: string;
  title: string;
  category: string;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  owner: string;
}

export interface MitigationStrategy {
  strategyId: string;
  riskId: string;
  approach: string;
  preventiveActions: string[];
  contingencyActions: string[];
}

export interface EscalationPath {
  pathId: string;
  level: number;
  role: string;
  trigger: string;
  responseTime: string;
}

export interface RiskAnalysisRuntimePayload {
  version: typeof RISK_ANALYSIS_RUNTIME_VERSION;
  proposalVersion: typeof PROPOSAL_GENERATION_VERSION;
  riskRegister: RiskRegisterEntry[];
  mitigationStrategies: MitigationStrategy[];
  escalationPaths: EscalationPath[];
  summary: string;
}
