import type { KeywordMapping, RequirementItem } from "../types";
import { extractRequirementKeywords } from "./normalizeRequirement";

/**
 * Keyword Mapping — 需求 → 检索词表
 */
export function mapRequirementKeywords(requirement: RequirementItem): KeywordMapping {
  const explicit = requirement.keywords || [];
  const fromTitle = extractRequirementKeywords(requirement.title, []);
  const fromText = extractRequirementKeywords(requirement.text, explicit);

  const sources: KeywordMapping["sources"] = [];
  const expandedTerms: string[] = [];

  if (explicit.length) {
    sources.push("explicit");
    expandedTerms.push(...explicit);
  }
  if (fromTitle.length) {
    sources.push("title");
    expandedTerms.push(...fromTitle);
  }
  sources.push("extracted");
  expandedTerms.push(...fromText);

  const keywords = [...new Set(expandedTerms.map((k) => k.toLowerCase()))].slice(0, 40);

  return {
    requirementId: requirement.id,
    keywords,
    expandedTerms: keywords,
    sources: [...new Set(sources)],
  };
}

export function mapAllRequirementKeywords(
  requirements: RequirementItem[],
): KeywordMapping[] {
  return requirements.map(mapRequirementKeywords);
}
