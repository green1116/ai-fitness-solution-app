/**
 * Operations O3 — Knowledge article
 */

import { KNOWLEDGE_CATEGORIES } from "../ticket/ticket.constants";
import type {
  KnowledgeArticle,
  KnowledgeCategory,
  PublishKnowledgeArticleInput,
} from "./knowledge.types";

const articles = new Map<string, KnowledgeArticle>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneArticle(article: KnowledgeArticle): KnowledgeArticle {
  return {
    ...article,
    tags: [...article.tags],
    metadata: { ...article.metadata },
  };
}

export function publishKnowledgeArticle(
  input: PublishKnowledgeArticleInput,
): KnowledgeArticle {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title) throw new Error("knowledge.title is required");
  if (!body) throw new Error("knowledge.body is required");
  if (!(KNOWLEDGE_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new Error(`invalid knowledge category: ${input.category}`);
  }

  const id = input.id?.trim() || createId("o3art");
  if (articles.has(id)) {
    throw new Error(`knowledge article already exists: ${id}`);
  }

  const tags = (input.tags ?? [])
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  const article: KnowledgeArticle = {
    id,
    title,
    category: input.category,
    body,
    tags,
    detail: `category=${input.category} tags=${tags.length}`,
    metadata: { ...(input.metadata ?? {}) },
    publishedAt: nowIso(),
  };
  articles.set(id, article);
  return cloneArticle(article);
}

export function getKnowledgeArticle(
  id: string,
): KnowledgeArticle | undefined {
  const article = articles.get(id.trim());
  return article ? cloneArticle(article) : undefined;
}

export function listKnowledgeArticles(filter?: {
  category?: KnowledgeCategory;
}): KnowledgeArticle[] {
  let result = [...articles.values()];
  if (filter?.category) {
    result = result.filter((a) => a.category === filter.category);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneArticle);
}

export function clearKnowledgeArticles(): void {
  articles.clear();
}
