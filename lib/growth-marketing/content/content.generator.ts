/**
 * V65 — Marketing content generator
 */

import { buildKeywordStrategy } from "../seo/keyword.strategy";
import type { SEOContent } from "../growth-marketing.types";
import { generateSEOContent } from "../seo/content.generator";

export type MarketingArticle = {
  title: string;
  excerpt: string;
  sections: string[];
  tags: string[];
};

export function generateMarketingContent(topic?: string): MarketingArticle {
  const seo = generateSEOContent(topic);
  const strategy = buildKeywordStrategy();

  return {
    title: seo.title,
    excerpt: seo.metaDescription,
    sections: seo.body.split("\n## ").filter(Boolean).map((s) => s.trim()),
    tags: strategy.primary.slice(0, 4),
  };
}

export function generateContentFromSEO(seo: SEOContent): MarketingArticle {
  return {
    title: seo.title,
    excerpt: seo.metaDescription,
    sections: seo.body.split("\n").filter((l) => l.startsWith("#") || l.length > 20),
    tags: seo.keywords.slice(0, 4),
  };
}
