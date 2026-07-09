/**
 * V73 P1 — Knowledge catalog types (read-only)
 */

export const V73_KNOWLEDGE_VERSION = "v73-knowledge-catalog-1" as const;
export const V73_KNOWLEDGE_FREEZE_VERSION = "v73-knowledge-catalog-freeze-1" as const;

export type KnowledgeStatus = "draft" | "active" | "paused" | "archived";

export type ConfidenceLevel = "low" | "medium" | "high";

export type AccessLevel = "public" | "internal" | "restricted" | "confidential";

export type KnowledgeItem = {
  id: string;
  document: string;
  topic: string;
  category: string;
  tag: string;
  owner: string;
  status: KnowledgeStatus;
  source: string;
  version: string;
  confidence: ConfidenceLevel;
  access: AccessLevel;
  required: boolean;
  description: string;
};

export type KnowledgeCatalogManifest = {
  version: typeof V73_KNOWLEDGE_VERSION;
  entryCount: number;
  categoryCount: number;
  sourceCount: number;
  catalogComplete: boolean;
  items: KnowledgeItem[];
  summary: string;
};

export type KnowledgeCatalogSignals = {
  catalogComplete?: boolean;
  freezeVersionDeclared?: boolean;
};

export type KnowledgeCatalogReport = {
  version: typeof V73_KNOWLEDGE_VERSION;
  freezeVersion: typeof V73_KNOWLEDGE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  manifest: KnowledgeCatalogManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
