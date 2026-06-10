import type { KNOWLEDGE_BASE_VERSION } from "../shared/types";
import type { KnowledgeCatalogCategory } from "../catalog/types";

export const KNOWLEDGE_SEARCH_RUNTIME_VERSION = "v12.5-knowledge-search-1" as const;

export type SearchMode = "keyword" | "category" | "profile";

export interface SearchHit {
  hitId: string;
  assetId: string;
  category: KnowledgeCatalogCategory;
  title: string;
  snippet: string;
  score: number;
}

export interface KnowledgeSearchResult {
  searchId: string;
  mode: SearchMode;
  query: string;
  hits: SearchHit[];
  hitCount: number;
  searchReady: boolean;
}

export interface KnowledgeSearchRuntimePayload {
  version: typeof KNOWLEDGE_SEARCH_RUNTIME_VERSION;
  knowledgeVersion: typeof KNOWLEDGE_BASE_VERSION;
  keywordSearch: KnowledgeSearchResult;
  categorySearch: KnowledgeSearchResult;
  profileSearch: KnowledgeSearchResult;
  summary: string;
}
