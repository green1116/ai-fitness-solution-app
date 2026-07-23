/**
 * Operations O3 — Knowledge index
 */

import { getKnowledgeArticle } from "./knowledge.article";
import type {
  IndexKnowledgeArticleInput,
  KnowledgeIndexEntry,
} from "./knowledge.types";

const index = new Map<string, KnowledgeIndexEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(entry: KnowledgeIndexEntry): KnowledgeIndexEntry {
  return { ...entry, keywords: [...entry.keywords] };
}

export function indexKnowledgeArticle(
  input: IndexKnowledgeArticleInput,
): KnowledgeIndexEntry {
  const articleId = input.articleId.trim();
  if (!articleId) throw new Error("knowledgeIndex.articleId is required");
  const article = getKnowledgeArticle(articleId);
  if (!article) {
    throw new Error(`knowledge article not found: ${articleId}`);
  }

  const id = input.id?.trim() || createId("o3idx");
  if (index.has(id)) {
    throw new Error(`knowledge index already exists: ${id}`);
  }

  const keywords = [
    article.title.toLowerCase(),
    article.category.toLowerCase(),
    ...article.tags.map((t) => t.toLowerCase()),
  ];
  const entry: KnowledgeIndexEntry = {
    id,
    articleId: article.id,
    category: article.category,
    keywords,
    detail: `article=${article.id} keywords=${keywords.length}`,
    indexedAt: nowIso(),
  };
  index.set(id, entry);
  return cloneEntry(entry);
}

export function getKnowledgeIndexEntry(
  id: string,
): KnowledgeIndexEntry | undefined {
  const entry = index.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listKnowledgeIndex(filter?: {
  articleId?: string;
}): KnowledgeIndexEntry[] {
  let result = [...index.values()];
  if (filter?.articleId) {
    const aid = filter.articleId.trim();
    result = result.filter((e) => e.articleId === aid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEntry);
}

export function clearKnowledgeIndex(): void {
  index.clear();
}
