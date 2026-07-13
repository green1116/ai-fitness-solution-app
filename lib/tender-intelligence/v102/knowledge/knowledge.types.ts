/**
 * E02-P1 — Tender Knowledge Graph Kernel types
 * KnowledgeNode → KnowledgeEdge → KnowledgeGraph lifecycle
 */

export const V102_TENDER_KNOWLEDGE_VERSION = "v102-tender-knowledge-1" as const;
export const V102_TENDER_KNOWLEDGE_FREEZE_VERSION =
  "v102-tender-knowledge-freeze-1" as const;

export type KnowledgeNodeKind =
  | "project"
  | "organization"
  | "requirement"
  | "equipment"
  | "clause"
  | "standard"
  | "budget"
  | "deliverable"
  | "location"
  | "other";

export type KnowledgeEdgeKind =
  | "belongs_to"
  | "requires"
  | "references"
  | "constrains"
  | "supplies"
  | "located_in"
  | "owns"
  | "related_to";

export type KnowledgeGraphStatus = "pending" | "drafted" | "ready" | "failed";

export type KnowledgeLifecycleStage = "node" | "edge" | "graph";

export type KnowledgeNode = {
  id: string;
  kind: KnowledgeNodeKind;
  label: string;
  aliases: string[];
  properties: Readonly<Record<string, string>>;
  sourceHint?: string;
  confidence: number;
  readOnly: true;
};

export type KnowledgeEdge = {
  id: string;
  kind: KnowledgeEdgeKind;
  fromNodeId: string;
  toNodeId: string;
  label: string;
  weight: number;
  properties: Readonly<Record<string, string>>;
  readOnly: true;
};

export type KnowledgeGraph = {
  id: string;
  status: KnowledgeGraphStatus;
  title: string;
  nodeCount: number;
  edgeCount: number;
  kindCoverage: KnowledgeNodeKind[];
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  summary: string;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type KnowledgeLifecycleTransition = {
  from: KnowledgeLifecycleStage;
  to: KnowledgeLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type KnowledgeLifecycle = {
  current: KnowledgeLifecycleStage;
  stages: KnowledgeLifecycleStage[];
  transitions: KnowledgeLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type KnowledgeSeedNode = {
  kind: KnowledgeNodeKind;
  label: string;
  aliases?: string[];
  properties?: Record<string, string>;
  sourceHint?: string;
  confidence?: number;
};

export type KnowledgeSeedEdge = {
  kind: KnowledgeEdgeKind;
  fromLabel: string;
  toLabel: string;
  label?: string;
  weight?: number;
  properties?: Record<string, string>;
};

export type KnowledgeKernelInput = {
  deploymentId?: string;
  rawText?: string;
  titleHint?: string;
  projectHint?: string;
  organizationHint?: string;
  seedNodes?: KnowledgeSeedNode[];
  seedEdges?: KnowledgeSeedEdge[];
};

export type KnowledgeKernelResult = {
  version: typeof V102_TENDER_KNOWLEDGE_VERSION;
  freezeVersion: typeof V102_TENDER_KNOWLEDGE_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  graph: KnowledgeGraph | null;
  lifecycle: KnowledgeLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};
