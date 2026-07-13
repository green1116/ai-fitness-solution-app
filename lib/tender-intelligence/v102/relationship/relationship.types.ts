/**
 * E02-P3 — Knowledge Relationship Engine types
 * Transform entity candidates into knowledge relationships
 */

import type {
  KnowledgeEdgeKind,
  KnowledgeNodeKind,
  KnowledgeSeedEdge,
} from "../knowledge/knowledge.types";
import type {
  EntityRelationCandidate,
  ExtractedEntity,
  KnowledgeGraphCandidatePack,
} from "../extraction/extraction.types";

export const V102_KNOWLEDGE_RELATIONSHIP_VERSION =
  "v102-knowledge-relationship-1" as const;
export const V102_KNOWLEDGE_RELATIONSHIP_FREEZE_VERSION =
  "v102-knowledge-relationship-freeze-1" as const;

export type RelationshipLifecycleStage =
  | "candidates"
  | "relationships"
  | "network";

export type RelationshipNetworkStatus =
  | "pending"
  | "linked"
  | "ready"
  | "failed";

export type RelationshipStrength = "weak" | "moderate" | "strong";

export type KnowledgeRelationship = {
  id: string;
  kind: KnowledgeEdgeKind;
  fromEntityId: string;
  toEntityId: string;
  fromLabel: string;
  toLabel: string;
  fromKind: KnowledgeNodeKind;
  toKind: KnowledgeNodeKind;
  label: string;
  weight: number;
  confidence: number;
  strength: RelationshipStrength;
  evidence: string;
  sourceCandidateId?: string;
  derived: boolean;
  readOnly: true;
};

export type RelationshipNetwork = {
  id: string;
  status: RelationshipNetworkStatus;
  title: string;
  relationshipCount: number;
  strongCount: number;
  kindCoverage: KnowledgeEdgeKind[];
  relationships: KnowledgeRelationship[];
  edgeSeeds: KnowledgeSeedEdge[];
  summary: string;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type RelationshipLifecycleTransition = {
  from: RelationshipLifecycleStage;
  to: RelationshipLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type RelationshipLifecycle = {
  current: RelationshipLifecycleStage;
  stages: RelationshipLifecycleStage[];
  transitions: RelationshipLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type RelationshipKernelInput = {
  deploymentId?: string;
  titleHint?: string;
  candidates?: KnowledgeGraphCandidatePack;
  entities?: ExtractedEntity[];
  relationCandidates?: EntityRelationCandidate[];
  minConfidence?: number;
};

export type RelationshipKernelResult = {
  version: typeof V102_KNOWLEDGE_RELATIONSHIP_VERSION;
  freezeVersion: typeof V102_KNOWLEDGE_RELATIONSHIP_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  relationships: KnowledgeRelationship[];
  network: RelationshipNetwork | null;
  lifecycle: RelationshipLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};
