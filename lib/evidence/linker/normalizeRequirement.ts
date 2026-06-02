import type { RequirementAnchor, RequirementInput, RequirementItem } from "../types";
import { tokenizeTerms } from "./tokenize";

/**
 * 从需求正文提取关键词（确定性）
 */
export function extractRequirementKeywords(
  text: string,
  explicit: string[] = [],
): string[] {
  const fromText = tokenizeTerms(text);
  const merged = [
    ...explicit.map((k) => k.trim().toLowerCase()).filter(Boolean),
    ...fromText,
  ];
  return [...new Set(merged)].slice(0, 32);
}

export function normalizeRequirementItem(input: RequirementInput): RequirementItem {
  const text = String(input.text || "").trim();
  const title = String(input.title || text.slice(0, 80) || input.id).trim();
  return {
    id: input.id,
    section: input.section,
    title,
    text,
    keywords: extractRequirementKeywords(text, input.keywords),
    mandatory: input.mandatory,
    category: input.category,
  };
}

export function requirementAnchorToItem(anchor: RequirementAnchor): RequirementItem {
  return normalizeRequirementItem({
    id: anchor.id,
    section: anchor.category,
    title: anchor.text.slice(0, 80),
    text: anchor.text,
    mandatory: anchor.mandatory,
    category: anchor.category as RequirementItem["category"],
  });
}

export function requirementItemsFromAnchors(
  anchors: RequirementAnchor[],
): RequirementItem[] {
  return anchors.map(requirementAnchorToItem);
}
