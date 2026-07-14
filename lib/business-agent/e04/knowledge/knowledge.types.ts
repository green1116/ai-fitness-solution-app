/**
 * E04-P6 — Business Knowledge Runtime types
 * Knowledge layer above business memory
 */

import {
  E04_KNOWLEDGE_BASE,
  E04_KNOWLEDGE_FREEZE_VERSION,
  E04_KNOWLEDGE_RUNTIME_ID,
  E04_KNOWLEDGE_VERSION,
  KNOWLEDGE_ENTITY_KINDS,
  KNOWLEDGE_RELATION_KINDS,
  KNOWLEDGE_TRACE_EVENT_KINDS,
} from "./knowledge.constants";

export type KnowledgeEntityKind = (typeof KNOWLEDGE_ENTITY_KINDS)[number];
export type KnowledgeRelationKind = (typeof KNOWLEDGE_RELATION_KINDS)[number];
export type KnowledgeTraceEventKind =
  (typeof KNOWLEDGE_TRACE_EVENT_KINDS)[number];

export type KnowledgeEntity = {
  id: string;
  kind: KnowledgeEntityKind;
  name: string;
  description: string;
  tags: string[];
  /** Optional link to E04 memory record id */
  memoryRef?: string;
  attributes: Readonly<Record<string, unknown>>;
  readOnly: true;
};

export type KnowledgeRelation = {
  id: string;
  kind: KnowledgeRelationKind;
  fromId: string;
  toId: string;
  label: string;
  attributes: Readonly<Record<string, unknown>>;
  readOnly: true;
};

export type KnowledgeGraphSnapshot = {
  entityCount: number;
  relationCount: number;
  byEntityKind: Readonly<Record<string, number>>;
  byRelationKind: Readonly<Record<string, number>>;
  readOnly: true;
};

export type KnowledgeQuery = {
  kind?: KnowledgeEntityKind;
  text?: string;
  tags?: string[];
  neighborOf?: string;
  relationKind?: KnowledgeRelationKind;
  limit?: number;
};

export type KnowledgeHit = {
  entity: KnowledgeEntity;
  score: number;
  reasons: string[];
  readOnly: true;
};

export type KnowledgeRetrieveResult = {
  query: KnowledgeQuery;
  hits: KnowledgeHit[];
  hitCount: number;
  readOnly: true;
};

export type KnowledgeValidationIssue = {
  code: string;
  message: string;
  entityId?: string;
  relationId?: string;
  readOnly: true;
};

export type KnowledgeValidationResult = {
  valid: boolean;
  issueCount: number;
  issues: KnowledgeValidationIssue[];
  readOnly: true;
};

export type KnowledgeRegistryManifest = {
  runtimeId: typeof E04_KNOWLEDGE_RUNTIME_ID;
  version: typeof E04_KNOWLEDGE_VERSION;
  freezeVersion: typeof E04_KNOWLEDGE_FREEZE_VERSION;
  base: typeof E04_KNOWLEDGE_BASE;
  entityCount: number;
  relationCount: number;
  catalogComplete: boolean;
  readOnly: true;
};
