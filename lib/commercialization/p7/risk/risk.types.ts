/**
 * Commercialization P7 — Risk types
 */

import type { RISK_LEVELS } from "../governance/governance.constants";

export type RiskLevel = (typeof RISK_LEVELS)[number];
export type RiskMetadata = Record<string, unknown>;

export type RiskAssessment = {
  id: string;
  governanceId: string;
  title: string;
  impact: number;
  likelihood: number;
  score: number;
  level: RiskLevel;
  detail: string;
  metadata: RiskMetadata;
  assessedAt: string;
};

export type AssessRiskInput = {
  id?: string;
  governanceId: string;
  title: string;
  impact: number;
  likelihood: number;
  metadata?: RiskMetadata;
};

export type RiskControl = {
  id: string;
  assessmentId: string;
  name: string;
  mitigation: string;
  residualLevel: RiskLevel;
  detail: string;
  createdAt: string;
};

export type ApplyRiskControlInput = {
  id?: string;
  assessmentId: string;
  name: string;
  mitigation: string;
  residualLevel: RiskLevel;
};
