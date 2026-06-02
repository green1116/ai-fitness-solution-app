import { parseTenderDocument, type ParseTenderInput } from "@/lib/tender/parser";
import { extractRequirements } from "@/lib/tender/requirements";
import type {
  TenderIntelligenceResult,
  TenderRequirementCounts,
} from "@/lib/tender/types";

export function countRequirements(
  requirements: TenderIntelligenceResult["requirements"],
): TenderRequirementCounts {
  const counts: TenderRequirementCounts = {
    total: requirements.length,
    technical: 0,
    commercial: 0,
    qualification: 0,
    scoring: 0,
    attachment: 0,
  };
  for (const r of requirements) {
    counts[r.category] += 1;
  }
  return counts;
}

/** 完整 Tender Intelligence 管道 */
export async function analyzeTender(
  input: ParseTenderInput,
): Promise<TenderIntelligenceResult> {
  const parsed = await parseTenderDocument(input);
  const requirements = extractRequirements(parsed);
  return { ...parsed, requirements };
}
