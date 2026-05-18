import type { SemanticRequirement, SemanticRisk, SemanticScoringItem } from "./types";
import type { ComplianceNode, ComplianceStatus, SemanticSection } from "./types";

const RESPONSE_ROLES = new Set([
  "implementation",
  "response",
  "planning",
  "configuration",
  "risk",
]);

function tokenize(text: string): string[] {
  return text
    .replace(/[^\u4e00-\u9fffA-Za-z0-9]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .slice(0, 40);
}

function overlapScore(reqTokens: string[], content: string): number {
  if (!reqTokens.length) return 0;
  let hit = 0;
  for (const t of reqTokens) {
    if (content.includes(t)) hit += 1;
  }
  return hit / reqTokens.length;
}

function statusFromScore(score: number): ComplianceStatus {
  if (score >= 0.35) return "covered";
  if (score >= 0.12) return "partial";
  return "missing";
}

/**
 * requirement → section / scoring / risk 合规映射
 */
export function buildComplianceGraph(
  requirements: SemanticRequirement[],
  sections: SemanticSection[],
  scoringItems: SemanticScoringItem[],
  risks: SemanticRisk[],
): ComplianceNode[] {
  const responseSections = sections.filter(
    (s) =>
      RESPONSE_ROLES.has(s.semanticRole) ||
      s.tenderPhase === "delivery" ||
      s.tenderPhase === "commercial",
  );

  return requirements.map((req) => {
    const tokens = tokenize(req.normalizedRequirement);
    const linkedSections: string[] = [];
    let best = 0;

    for (const sec of responseSections) {
      const score = overlapScore(tokens, sec.content);
      if (score > 0.08) linkedSections.push(sec.id);
      if (score > best) best = score;
    }

    if (req.sourceSectionId && !linkedSections.includes(req.sourceSectionId)) {
      linkedSections.push(req.sourceSectionId);
      best = Math.max(best, 0.4);
    }

    const linkedScoring = scoringItems
      .filter(
        (s) =>
          req.relatedScoringItems?.includes(s.id) ||
          s.evaluationFocus.some((f) => req.requirement.includes(f.slice(0, 2))),
      )
      .map((s) => s.id);

    const linkedRisks =
      risks
        .filter((r) => r.linkedRequirements?.includes(req.id))
        .map((r) => r.id) || [];

    return {
      requirementId: req.id,
      linkedSections: [...new Set(linkedSections)],
      linkedScoringItems: [...new Set(linkedScoring)],
      linkedRisks: [...new Set(linkedRisks)],
      responseStatus: statusFromScore(best),
    };
  });
}
