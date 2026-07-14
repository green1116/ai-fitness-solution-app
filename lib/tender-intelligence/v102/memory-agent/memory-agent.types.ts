/**
 * E02-P6 — Enterprise Memory Agent types
 * Agent → Retrieval → Recommendation lifecycle
 */

import type { KnowledgeGraph } from "../knowledge/knowledge.types";
import type { KnowledgeContext } from "../retrieval/retrieval.types";
import type { SimilarTenderProfile } from "../similarity/similarity.types";

export const V102_MEMORY_AGENT_VERSION = "v102-memory-agent-1" as const;
export const V102_MEMORY_AGENT_FREEZE_VERSION =
  "v102-memory-agent-freeze-1" as const;

export type MemoryAgentRole =
  | "retriever"
  | "similarity"
  | "recommender"
  | "coordinator";

export type MemoryAgentCapability =
  | "retrieve"
  | "compare"
  | "recommend"
  | "coordinate";

export type MemoryAgentLifecycleStage = "agent" | "retrieval" | "recommendation";

export type MemoryRecommendationStatus =
  | "pending"
  | "drafted"
  | "ready"
  | "failed";

export type MemoryAgentDefinition = {
  id: string;
  role: MemoryAgentRole;
  name: string;
  capability: MemoryAgentCapability;
  kernelRef: string;
  dependsOn: string[];
  optional: boolean;
  readOnly: true;
};

export type MemoryAgentRegistryManifest = {
  version: typeof V102_MEMORY_AGENT_VERSION;
  agentCount: number;
  roles: MemoryAgentRole[];
  agents: MemoryAgentDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};

export type MemoryRecommendationItem = {
  id: string;
  category: "reuse" | "evidence" | "pricing" | "compliance" | "delivery";
  title: string;
  rationale: string;
  priority: "high" | "medium" | "low";
  sourceRefs: string[];
  readOnly: true;
};

export type MemoryAgentRecommendation = {
  id: string;
  status: MemoryRecommendationStatus;
  title: string;
  contextId: string;
  profileId: string;
  itemCount: number;
  highPriorityCount: number;
  items: MemoryRecommendationItem[];
  narrative: string[];
  summary: string;
  createdAt: string;
  updatedAt: string;
  readOnly: true;
};

export type MemoryAgentLifecycleTransition = {
  from: MemoryAgentLifecycleStage;
  to: MemoryAgentLifecycleStage;
  at: string;
  note?: string;
  readOnly: true;
};

export type MemoryAgentLifecycle = {
  current: MemoryAgentLifecycleStage;
  stages: MemoryAgentLifecycleStage[];
  transitions: MemoryAgentLifecycleTransition[];
  complete: boolean;
  readOnly: true;
};

export type MemoryAgentKernelInput = {
  deploymentId?: string;
  graph: KnowledgeGraph;
  queryText: string;
  titleHint?: string;
  retrievalLimit?: number;
  similarityLimit?: number;
};

export type MemoryAgentKernelResult = {
  version: typeof V102_MEMORY_AGENT_VERSION;
  freezeVersion: typeof V102_MEMORY_AGENT_FREEZE_VERSION;
  reportId: string;
  deploymentId: string;
  generatedAt: string;
  registry: MemoryAgentRegistryManifest;
  context: KnowledgeContext | null;
  profile: SimilarTenderProfile | null;
  recommendation: MemoryAgentRecommendation | null;
  lifecycle: MemoryAgentLifecycle;
  ready: boolean;
  readinessScore: number;
  summary: string;
};
