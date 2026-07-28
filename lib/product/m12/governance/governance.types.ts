/**
 * Product M12 — Agent Governance domain types
 */

import type {
  AGENT_GOVERNANCE_APPROVALS,
  AGENT_GOVERNANCE_BINDING_STATUSES,
  AGENT_GOVERNANCE_READINESS_VERDICTS,
  AGENT_GOVERNANCE_REVIEW_STATUSES,
  AGENT_GOVERNANCE_RISK_LEVELS,
  AGENT_GOVERNANCE_STANDARD_KINDS,
  AGENT_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_AGENT_GOVERNANCE_BASE,
  PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AGENT_GOVERNANCE_ID,
  PRODUCT_AGENT_GOVERNANCE_VERSION,
} from "./governance.constants";

export type AgentGovernanceStandardKind =
  (typeof AGENT_GOVERNANCE_STANDARD_KINDS)[number];
export type AgentGovernanceStandardStatus =
  (typeof AGENT_GOVERNANCE_STANDARD_STATUSES)[number];
export type AgentGovernanceReviewStatus =
  (typeof AGENT_GOVERNANCE_REVIEW_STATUSES)[number];
export type AgentGovernanceApproval =
  (typeof AGENT_GOVERNANCE_APPROVALS)[number];
export type AgentGovernanceRiskLevel =
  (typeof AGENT_GOVERNANCE_RISK_LEVELS)[number];
export type AgentGovernanceBindingStatus =
  (typeof AGENT_GOVERNANCE_BINDING_STATUSES)[number];
export type AgentGovernanceReadinessVerdict =
  (typeof AGENT_GOVERNANCE_READINESS_VERDICTS)[number];
export type AgentGovernanceMetadata = Record<string, unknown>;

export type AgentGovernanceStandard = {
  id: string;
  standardKey: string;
  kind: AgentGovernanceStandardKind;
  status: AgentGovernanceStandardStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: AgentGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentGovernanceStandardInput = {
  id?: string;
  standardKey: string;
  kind: AgentGovernanceStandardKind;
  title: string;
  summary: string;
  metadata?: AgentGovernanceMetadata;
};

export type UpdateAgentGovernanceStandardStatusInput = {
  standardId: string;
  status: AgentGovernanceStandardStatus;
};

/** Governance review — soft-ref to compatibility matrixKey. */
export type AgentGovernanceReview = {
  id: string;
  standardId: string;
  reviewKey: string;
  sequence: number;
  status: AgentGovernanceReviewStatus;
  approval: AgentGovernanceApproval;
  riskLevel: AgentGovernanceRiskLevel;
  matrixKeyRef: string;
  summary: string;
  detail: string;
  metadata: AgentGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentGovernanceReviewInput = {
  id?: string;
  standardId: string;
  reviewKey: string;
  sequence: number;
  approval: AgentGovernanceApproval;
  riskLevel: AgentGovernanceRiskLevel;
  matrixKeyRef: string;
  summary: string;
  metadata?: AgentGovernanceMetadata;
};

export type UpdateAgentGovernanceReviewStatusInput = {
  reviewId: string;
  status: AgentGovernanceReviewStatus;
};

/** Soft binding of review to freeze-gate / pair key. */
export type AgentGovernanceBinding = {
  id: string;
  standardId: string;
  reviewId: string;
  bindingKey: string;
  freezeGateRef: string;
  pairKeyRef: string;
  status: AgentGovernanceBindingStatus;
  detail: string;
  metadata: AgentGovernanceMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindAgentGovernanceReviewInput = {
  id?: string;
  standardId: string;
  reviewId: string;
  bindingKey: string;
  freezeGateRef: string;
  pairKeyRef: string;
  metadata?: AgentGovernanceMetadata;
};

export type AgentGovernanceReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AgentGovernanceReadinessResult = {
  verdict: AgentGovernanceReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AgentGovernanceReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AgentGovernanceManifest = {
  governanceRuntimeId: typeof PRODUCT_AGENT_GOVERNANCE_ID;
  version: typeof PRODUCT_AGENT_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION;
  base: typeof PRODUCT_AGENT_GOVERNANCE_BASE;
  standardCount: number;
  reviewCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
