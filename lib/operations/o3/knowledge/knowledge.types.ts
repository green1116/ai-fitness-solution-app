/**
 * Operations O3 — Knowledge types
 */

import type { KNOWLEDGE_CATEGORIES } from "../ticket/ticket.constants";

export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];
export type KnowledgeMetadata = Record<string, unknown>;

export type KnowledgeArticle = {
  id: string;
  title: string;
  category: KnowledgeCategory;
  body: string;
  tags: string[];
  detail: string;
  metadata: KnowledgeMetadata;
  publishedAt: string;
};

export type PublishKnowledgeArticleInput = {
  id?: string;
  title: string;
  category: KnowledgeCategory;
  body: string;
  tags?: string[];
  metadata?: KnowledgeMetadata;
};

export type KnowledgeIndexEntry = {
  id: string;
  articleId: string;
  category: KnowledgeCategory;
  keywords: string[];
  detail: string;
  indexedAt: string;
};

export type IndexKnowledgeArticleInput = {
  id?: string;
  articleId: string;
};
