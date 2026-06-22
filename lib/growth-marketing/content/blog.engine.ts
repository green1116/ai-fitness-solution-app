/**
 * V65 — Blog engine
 */

import { generateMarketingContent } from "./content.generator";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";

export function generateBlogPost(topic?: string) {
  const article = generateMarketingContent(topic);
  const post = {
    ...article,
    slug: article.title.replace(/\s+/g, "-").toLowerCase().slice(0, 80),
    publishedAt: new Date().toISOString(),
    readingMinutes: Math.max(3, Math.ceil(article.sections.join(" ").length / 800)),
  };

  appendGrowthEvent({
    event: "growth.blog_generated",
    meta: { slug: post.slug, tags: post.tags.length, layer: "v65" },
  });

  return post;
}
