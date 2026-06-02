import type { TenderRequirementImportance } from "@/lib/tender/types";

const MANDATORY = [/必须/, /应当/, /须/, /不得/, /不低于/, /不少于/, /应提供/, /应具备/];
const PREFERRED = [/优先/, /建议/, /宜/, /推荐/];
const SCORED = [/满分/, /\d+\s*分/, /得分/, /评分/, /分值/];

/**
 * 判断条款重要程度（可扩展 LLM）
 */
export function detectImportance(text: string): TenderRequirementImportance {
  const t = text.trim();
  if (SCORED.some((p) => p.test(t))) return "scored";
  if (MANDATORY.some((p) => p.test(t))) return "mandatory";
  if (PREFERRED.some((p) => p.test(t))) return "preferred";
  return "mandatory";
}
