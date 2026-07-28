/**
 * Product M11 — Knowledge Platform Foundation domain types
 */

import type {
  KNOWLEDGE_ACCESS_LEVELS,
  KNOWLEDGE_DOMAIN_SCOPES,
  KNOWLEDGE_ENTITY_KINDS,
  KNOWLEDGE_ENTITY_STATUSES,
  KNOWLEDGE_GOVERNANCE_POLICY_KINDS,
  KNOWLEDGE_GOVERNANCE_POLICY_STATUSES,
  KNOWLEDGE_READINESS_VERDICTS,
  KNOWLEDGE_RETRIEVAL_MODES,
  PRODUCT_KNOWLEDGE_FOUNDATION_BASE,
  PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_FOUNDATION_ID,
  PRODUCT_KNOWLEDGE_FOUNDATION_VERSION,
} from "./knowledge.constants";

export type KnowledgeEntityKind = (typeof KNOWLEDGE_ENTITY_KINDS)[number];
export type KnowledgeEntityStatus =
  (typeof KNOWLEDGE_ENTITY_STATUSES)[number];
export type KnowledgeAccessLevel = (typeof KNOWLEDGE_ACCESS_LEVELS)[number];
export type KnowledgeDomainScope = (typeof KNOWLEDGE_DOMAIN_SCOPES)[number];
export type KnowledgeRetrievalMode =
  (typeof KNOWLEDGE_RETRIEVAL_MODES)[number];
export type KnowledgeGovernancePolicyKind =
  (typeof KNOWLEDGE_GOVERNANCE_POLICY_KINDS)[number];
export type KnowledgeGovernancePolicyStatus =
  (typeof KNOWLEDGE_GOVERNANCE_POLICY_STATUSES)[number];
export type KnowledgeReadinessVerdict =
  (typeof KNOWLEDGE_READINESS_VERDICTS)[number];
export type KnowledgeMetadata = Record<string, unknown>;

/** Frozen knowledge domain entity (in-memory declaration). */
export type KnowledgeEntity = {
  id: string;
  entityKey: string;
  kind: KnowledgeEntityKind;
  status: KnowledgeEntityStatus;
  access: KnowledgeAccessLevel;
  scope: KnowledgeDomainScope;
  title: string;
  summary: string;
  tags: string[];
  runtimeBaselineRef: string;
  detail: string;
  metadata: KnowledgeMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgeEntityInput = {
  id?: string;
  entityKey: string;
  kind: KnowledgeEntityKind;
  access?: KnowledgeAccessLevel;
  scope: KnowledgeDomainScope;
  title: string;
  summary: string;
  tags?: string[];
  runtimeBaselineRef?: string;
  metadata?: KnowledgeMetadata;
};

export type UpdateKnowledgeEntityStatusInput = {
  entityId: string;
  status: KnowledgeEntityStatus;
};

export type KnowledgeGovernancePolicy = {
  id: string;
  policyKey: string;
  kind: KnowledgeGovernancePolicyKind;
  status: KnowledgeGovernancePolicyStatus;
  title: string;
  entityKeyRef: string;
  ruleRef: string;
  detail: string;
  metadata: KnowledgeMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgeGovernancePolicyInput = {
  id?: string;
  policyKey: string;
  kind: KnowledgeGovernancePolicyKind;
  title: string;
  entityKeyRef: string;
  ruleRef: string;
  metadata?: KnowledgeMetadata;
};

export type KnowledgeRetrievalQuery = {
  queryKey: string;
  mode: KnowledgeRetrievalMode;
  terms: string[];
  tags?: string[];
  kind?: KnowledgeEntityKind;
  access?: KnowledgeAccessLevel;
  scope?: KnowledgeDomainScope;
};

export type KnowledgeRetrievalHit = {
  entityId: string;
  entityKey: string;
  kind: KnowledgeEntityKind;
  score: number;
  matchedOn: "KEY" | "TITLE" | "TAG" | "SUMMARY";
};

/** Declarative retrieval contract result — no vector/RAG execution. */
export type KnowledgeRetrievalContract = {
  id: string;
  contractKey: string;
  query: KnowledgeRetrievalQuery;
  hitCount: number;
  hits: KnowledgeRetrievalHit[];
  detail: string;
  metadata: KnowledgeMetadata;
  evaluatedAt: string;
};

export type EvaluateKnowledgeRetrievalContractInput = {
  id?: string;
  contractKey: string;
  query: KnowledgeRetrievalQuery;
  metadata?: KnowledgeMetadata;
};

export type KnowledgeEntityValidationIssue = {
  field: string;
  message: string;
};

export type KnowledgeEntityValidationResult = {
  ok: boolean;
  issues: KnowledgeEntityValidationIssue[];
};

export type KnowledgeReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type KnowledgeReadinessResult = {
  verdict: KnowledgeReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: KnowledgeReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type KnowledgeFoundationManifest = {
  foundationId: typeof PRODUCT_KNOWLEDGE_FOUNDATION_ID;
  version: typeof PRODUCT_KNOWLEDGE_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_KNOWLEDGE_FOUNDATION_BASE;
  entityCount: number;
  activeCount: number;
  policyCount: number;
  contractCount: number;
  checksum: string;
  createdAt: string;
};
