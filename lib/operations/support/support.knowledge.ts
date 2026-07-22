/**
 * Post-Launch P6 — Knowledge Base Model
 */

import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { KNOWLEDGE_ARTICLE_STATUSES } from "./support.constants";
import type {
  CreateKnowledgeArticleInput,
  KnowledgeArticle,
  KnowledgeArticleStatus,
} from "./support.types";

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

export function createKnowledgeArticle(
  input: CreateKnowledgeArticleInput,
): KnowledgeArticle {
  const title = input.title.trim();
  const productId = input.productId.trim();
  const category = input.category.trim();
  const body = input.body.trim();

  if (!title) throw new Error("knowledgeArticle.title is required");
  if (!category) throw new Error("knowledgeArticle.category is required");
  if (!body) throw new Error("knowledgeArticle.body is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const status: KnowledgeArticleStatus = input.status ?? "DRAFT";
  if (!(KNOWLEDGE_ARTICLE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid knowledge article status: ${status}`);
  }

  const id = input.id?.trim() || createId("kbart");
  if (articles.has(id)) {
    throw new Error(`knowledge article already exists: ${id}`);
  }

  const now = nowIso();
  const article: KnowledgeArticle = {
    id,
    title,
    productId,
    category,
    body,
    status,
    tags: input.tags?.map((t) => t.trim()).filter(Boolean) ?? [],
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
    publishedAt: status === "PUBLISHED" ? now : undefined,
  };
  articles.set(id, article);
  return cloneArticle(article);
}

export function publishKnowledgeArticle(id: string): KnowledgeArticle {
  const article = articles.get(id.trim());
  if (!article) throw new Error(`knowledge article not found: ${id}`);
  if (article.status === "ARCHIVED") {
    throw new Error(`cannot publish archived article: ${id}`);
  }
  const now = nowIso();
  article.status = "PUBLISHED";
  article.publishedAt = now;
  article.updatedAt = now;
  articles.set(article.id, article);
  return cloneArticle(article);
}

export function getKnowledgeArticle(id: string): KnowledgeArticle | undefined {
  const article = articles.get(id.trim());
  return article ? cloneArticle(article) : undefined;
}

export function listKnowledgeArticles(filter?: {
  productId?: string;
  status?: KnowledgeArticleStatus;
  category?: string;
}): KnowledgeArticle[] {
  let result = [...articles.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((a) => a.productId === pid);
  }
  if (filter?.status) result = result.filter((a) => a.status === filter.status);
  if (filter?.category) {
    const cat = filter.category.trim();
    result = result.filter((a) => a.category === cat);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneArticle);
}

export function clearKnowledgeArticles(): void {
  articles.clear();
}
