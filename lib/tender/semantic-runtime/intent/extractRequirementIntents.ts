import type { EvidenceType } from "@/lib/tender/evidence/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import type { RequirementIntent, RequirementIntentType } from "../types";
import type { SemanticEvidenceNeed } from "@/lib/tender/semantic-evidence/types";

function tokenize(text: string): string[] {
  return text
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9%/.\-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .slice(0, 12);
}

function resolveIntentType(
  category: string,
  measurable: boolean,
  evidenceRequired: boolean,
  relatedScoring: boolean,
  relatedRisk: boolean,
): RequirementIntentType {
  if (relatedRisk) return "mitigate_risk";
  if (relatedScoring) return "score_points";
  if (category === "qualification") return "demonstrate_compliance";
  if (category === "attachment") return "attach_proof";
  if (measurable) return "prove_capability";
  if (evidenceRequired) return "demonstrate_compliance";
  return "general";
}

/**
 * V3.2 需求意图抽取（确定性）
 */
export function extractRequirementIntents(
  graph: TenderSemanticGraph,
  needs: SemanticEvidenceNeed[],
): RequirementIntent[] {
  const needsByReq = new Map<string, SemanticEvidenceNeed[]>();
  for (const n of needs) {
    const list = needsByReq.get(n.requirementId) || [];
    list.push(n);
    needsByReq.set(n.requirementId, list);
  }

  return graph.requirements.map((req) => {
    const reqNeeds = needsByReq.get(req.id) || [];
    const expectedTypes = [
      ...new Set(reqNeeds.flatMap((n) => n.expectedTypes)),
    ] as EvidenceType[];

    const priority =
      req.importance === "mandatory"
        ? "mandatory"
        : req.importance === "preferred"
          ? "preferred"
          : "optional";

    return {
      requirementId: req.id,
      intentType: resolveIntentType(
        req.category,
        req.measurable,
        req.evidenceRequired,
        Boolean(req.relatedScoringItems?.length),
        Boolean(req.relatedRisks?.length),
      ),
      priority,
      keywords: tokenize(req.normalizedRequirement || req.requirement),
      expectedEvidenceTypes:
        expectedTypes.length > 0 ? expectedTypes : ["datasheet"],
      measurable: req.measurable,
      evidenceRequired: req.evidenceRequired,
    };
  });
}
