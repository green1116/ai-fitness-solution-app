import type { KNOWLEDGE_BASE_VERSION } from "../shared/types";

export const KNOWLEDGE_CATALOG_RUNTIME_VERSION = "v12.5-knowledge-catalog-1" as const;

export const KNOWLEDGE_CATALOG_CATEGORIES = [
  "project",
  "equipment",
  "proposal",
  "risk",
  "compliance",
] as const;

export type KnowledgeCatalogCategory = (typeof KNOWLEDGE_CATALOG_CATEGORIES)[number];

export interface CatalogEntry {
  entryId: string;
  category: KnowledgeCatalogCategory;
  categoryLabel: string;
  assetCount: number;
  assetIds: string[];
}

export interface KnowledgeCatalog {
  catalogId: string;
  entries: CatalogEntry[];
  totalAssets: number;
  generatedAt: string;
}

export interface KnowledgeCatalogRuntimePayload {
  version: typeof KNOWLEDGE_CATALOG_RUNTIME_VERSION;
  knowledgeVersion: typeof KNOWLEDGE_BASE_VERSION;
  catalog: KnowledgeCatalog;
  summary: string;
}
