/**
 * E02-P2 — Knowledge Entity Extraction Engine types
 * Extract entities from tender content into KnowledgeGraph candidates
 */

import type {
  KnowledgeEdgeKind,
  KnowledgeNodeKind,
  KnowledgeSeedEdge,
  KnowledgeSeedNode,
} from "../knowledge/knowledge.types";

export const V102_KNOWLEDGE_EXTRACTION_VERSION = "v102-knowledge-extraction-1" as const;
export const V102_KNOWLEDGE_EXTRACTION_FREEZE_VERSION =
  "v102-knowledge-extraction-freeze-1" as const;

export type ExtractionLifecycleStage = "content" | "entities" | "candidates";

export type ExtractionCandidateStatus = "pending" | "extracted" | "ready" | "failed";

export type ExtractionSpan = {
  start: number;
  end: number;
  text: string;
  readOnly: true;
};

export type ExtractedEntity = {
  id: string;
  kind: KnowledgeNodeKind;
  label: string;
  aliases: string[];
  evidence: string;
  span?: ExtractionSpan;
  confidence: number;
  sourceHint: string;
  properties: Readonly<Record<string, string>>;
  readOnly: true;
};

export type EntityRelationCandidate = {
  id: string;
  kind: KnowledgeEdgeKind;
  fromEntityId: string;
  toEntityId: string;
  label: string;
  weight: number;
  confidence: number;
  evidence: string;
  readOnly: true;
};

export type KnowledgeGraphCandidatePack = {
  id: string;
  status: ExtractionCandidateStatus;
  title: string;
  entityCount: number;
  relationCount: number;
  kindCoverage: KnowledgeNodeKind[];
  entities: ExtractedEntity[];
  relations: EntityRelationCandidate[];
  nodeSeeds: KnowledgeSeedNode[];
  edgeSeeds: KnowledgeSeedEdge[];
  summary: string;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type ExtractionLifecycleTransition = {
  from: ExtractionLifecycleStage;
  to: ExtractionLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type ExtractionLifecycle = {
  current: ExtractionLifecycleStage;
  stages: ExtractionLifecycleStage[];
  transitions: ExtractionLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type ExtractionKernelInput = {
  deploymentId?: string;
  rawText: string;
  titleHint?: string;
  projectHint?: string;
  organizationHint?: string;
};

export type ExtractionKernelResult = {
  version: typeof V102_KNOWLEDGE_EXTRACTION_VERSION;
  freezeVersion: typeof V102_KNOWLEDGE_EXTRACTION_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  contentLength: number;
  entities: ExtractedEntity[];
  relations: EntityRelationCandidate[];
  candidates: KnowledgeGraphCandidatePack | null;
  lifecycle: ExtractionLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};
