import type {
  CoverageLevel,
  EvidenceMatch,
  RequirementItem,
  RequirementLinkingResult,
} from "../types";

function coverageLevelFrom(
  req: RequirementItem,
  bestScore: number,
  matchCount: number,
): CoverageLevel {
  if (matchCount === 0) {
    return req.mandatory ? "risky" : "unsupported";
  }
  if (bestScore >= 0.65) return "fully_evidenced";
  if (bestScore >= 0.4) return "partially_evidenced";
  return req.mandatory ? "risky" : "partially_evidenced";
}

/**
 * Coverage Status — 基于关联匹配结果
 */
export function buildRequirementLinkingResults(
  requirements: RequirementItem[],
  matchesByRequirement: Map<string, EvidenceMatch[]>,
  mappings: import("../types").KeywordMapping[],
): RequirementLinkingResult[] {
  const mappingById = new Map(mappings.map((m) => [m.requirementId, m]));

  return requirements.map((req) => {
    const matches = matchesByRequirement.get(req.id) || [];
    const bestScore = matches.length ? Math.max(...matches.map((m) => m.score)) : 0;
    const level = coverageLevelFrom(req, bestScore, matches.length);
    const notes: string[] = [];

    if (!matches.length) {
      notes.push(req.mandatory ? "强制性要求未找到附件证据" : "未匹配到附件证据");
    } else {
      notes.push(`匹配 ${matches.length} 份证据，最高分 ${bestScore}`);
      const withLoc = matches.filter((m) => m.locations.length > 0).length;
      if (withLoc) notes.push(`${withLoc} 份证据含 OCR 块级定位`);
    }

    return {
      requirementId: req.id,
      requirementTitle: req.title,
      mapping: mappingById.get(req.id)!,
      matches,
      bestScore,
      coverageLevel: level,
      coverageNotes: notes,
    };
  });
}
