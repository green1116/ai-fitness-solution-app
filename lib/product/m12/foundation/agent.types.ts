/**
 * Product M12 — AI Agent Platform Foundation domain types
 */

import type {
  AGENT_CAPABILITY_KINDS,
  AGENT_CAPABILITY_STATUSES,
  AGENT_DOMAIN_SCOPES,
  AGENT_GOVERNANCE_POLICY_KINDS,
  AGENT_GOVERNANCE_POLICY_STATUSES,
  AGENT_INVOCATION_MODES,
  AGENT_READINESS_VERDICTS,
  AGENT_ROLES,
  AGENT_STATUSES,
  PRODUCT_AGENT_FOUNDATION_BASE,
  PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AGENT_FOUNDATION_ID,
  PRODUCT_AGENT_FOUNDATION_VERSION,
} from "./agent.constants";

export type AgentRole = (typeof AGENT_ROLES)[number];
export type AgentStatus = (typeof AGENT_STATUSES)[number];
export type AgentCapabilityKind = (typeof AGENT_CAPABILITY_KINDS)[number];
export type AgentCapabilityStatus =
  (typeof AGENT_CAPABILITY_STATUSES)[number];
export type AgentDomainScope = (typeof AGENT_DOMAIN_SCOPES)[number];
export type AgentInvocationMode = (typeof AGENT_INVOCATION_MODES)[number];
export type AgentGovernancePolicyKind =
  (typeof AGENT_GOVERNANCE_POLICY_KINDS)[number];
export type AgentGovernancePolicyStatus =
  (typeof AGENT_GOVERNANCE_POLICY_STATUSES)[number];
export type AgentReadinessVerdict =
  (typeof AGENT_READINESS_VERDICTS)[number];
export type AgentMetadata = Record<string, unknown>;

/** Frozen agent definition (in-memory declaration). */
export type AgentDefinition = {
  id: string;
  agentKey: string;
  role: AgentRole;
  status: AgentStatus;
  scope: AgentDomainScope;
  title: string;
  summary: string;
  knowledgeBaselineRef: string;
  detail: string;
  metadata: AgentMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentDefinitionInput = {
  id?: string;
  agentKey: string;
  role: AgentRole;
  scope: AgentDomainScope;
  title: string;
  summary: string;
  knowledgeBaselineRef?: string;
  metadata?: AgentMetadata;
};

export type UpdateAgentDefinitionStatusInput = {
  agentId: string;
  status: AgentStatus;
};

export type AgentCapability = {
  id: string;
  agentId: string;
  capabilityKey: string;
  kind: AgentCapabilityKind;
  status: AgentCapabilityStatus;
  summary: string;
  detail: string;
  metadata: AgentMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentCapabilityInput = {
  id?: string;
  agentId: string;
  capabilityKey: string;
  kind: AgentCapabilityKind;
  summary: string;
  metadata?: AgentMetadata;
};

export type UpdateAgentCapabilityStatusInput = {
  capabilityId: string;
  status: AgentCapabilityStatus;
};

export type AgentGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: AgentGovernancePolicyKind;
  status: AgentGovernancePolicyStatus;
  title: string;
  agentKeyRef: string;
  ruleRef: string;
  detail: string;
  metadata: AgentMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: AgentGovernancePolicyKind;
  title: string;
  agentKeyRef: string;
  ruleRef: string;
  metadata?: AgentMetadata;
};

export type AgentInvocationQuery = {
  queryKey: string;
  mode: AgentInvocationMode;
  role?: AgentRole;
  capabilityKind?: AgentCapabilityKind;
  scope?: AgentDomainScope;
  agentKeys?: string[];
};

export type AgentInvocationHit = {
  agentId: string;
  agentKey: string;
  role: AgentRole;
  capabilityKey: string;
  matchedOn: "AGENT" | "ROLE" | "CAPABILITY" | "SCOPE";
};

/** Declarative invocation contract — no agent execution. */
export type AgentInvocationContract = {
  id: string;
  contractKey: string;
  query: AgentInvocationQuery;
  hitCount: number;
  hits: AgentInvocationHit[];
  detail: string;
  metadata: AgentMetadata;
  evaluatedAt: string;
};

export type EvaluateAgentInvocationContractInput = {
  id?: string;
  contractKey: string;
  query: AgentInvocationQuery;
  metadata?: AgentMetadata;
};

export type AgentDefinitionValidationIssue = {
  field: string;
  message: string;
};

export type AgentDefinitionValidationResult = {
  ok: boolean;
  issues: AgentDefinitionValidationIssue[];
};

export type AgentReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AgentReadinessResult = {
  verdict: AgentReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AgentReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AgentFoundationManifest = {
  foundationId: typeof PRODUCT_AGENT_FOUNDATION_ID;
  version: typeof PRODUCT_AGENT_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_AGENT_FOUNDATION_BASE;
  agentCount: number;
  activeCount: number;
  capabilityCount: number;
  policyCount: number;
  contractCount: number;
  checksum: string;
  createdAt: string;
};
