import { scoreEvidenceMatch } from "@/lib/tender/evidence/matching";
import type { EvidenceRegistry } from "@/lib/tender/evidence/types";
import type {
  EvidenceSemanticProfile,
  RequirementIntent,
  SemanticMatchResult,
} from "../types";

const MIN_MATCH_SCORE = 0.38;

/**
 * V3.2 语义证据匹配（类型 + 关键词 + 意图 + registry）
 */
export function runSemanticEvidenceMatching(
  intents: RequirementIntent[],
  profiles: EvidenceSemanticProfile[],
  registry: EvidenceRegistry,
): SemanticMatchResult[] {
  const results: SemanticMatchResult[] = [];
  const profileById = new Map(profiles.map((p) => [p.evidenceId, p]));

  for (const intent of intents) {
    const linkedFromRegistry = registry.links
      .filter((l) => l.requirementId === intent.requirementId)
      .map((l) => l.evidenceId);

    for (const evidenceId of linkedFromRegistry) {
      const profile = profileById.get(evidenceId);
      results.push({
        requirementId: intent.requirementId,
        evidenceId,
        matchScore: Math.min(1, (profile?.strengthScore ?? 0.7) + 0.15),
        matchedBy: "registry_link",
        intentType: intent.intentType,
      });
    }

    for (const profile of profiles) {
      if (linkedFromRegistry.includes(profile.evidenceId)) continue;

      const typeMatch = intent.expectedEvidenceTypes.includes(profile.evidenceType);
      const keywordOverlap = intent.keywords.some((k) =>
        profile.semanticTags.some(
          (t) => t.includes(k.toLowerCase()) || profile.title.includes(k),
        ),
      );
      const intentMatch = profile.matchedIntentTypes.includes(intent.intentType);

      let score = 0.3;
      let matchedBy: SemanticMatchResult["matchedBy"] = "keyword";

      if (typeMatch) {
        score += 0.25;
        matchedBy = "type";
      }
      if (keywordOverlap) score += 0.2;
      if (intentMatch) {
        score += 0.2;
        matchedBy = "intent";
      }

      const doc = registry.documents.find((d) => d.id === profile.evidenceId);
      if (doc) {
        const fieldMatch = scoreEvidenceMatch(doc, {
          requirementId: intent.requirementId,
          requirementText: intent.keywords.join(" "),
          parameterName: intent.keywords[0],
        });
        score = Math.max(score, fieldMatch.confidence);
      }

      score *= profile.strengthScore;

      if (score >= MIN_MATCH_SCORE) {
        results.push({
          requirementId: intent.requirementId,
          evidenceId: profile.evidenceId,
          matchScore: Math.min(1, Math.round(score * 100) / 100),
          matchedBy,
          intentType: intent.intentType,
        });
      }
    }
  }

  const bestByPair = new Map<string, SemanticMatchResult>();
  for (const m of results) {
    const key = `${m.requirementId}:${m.evidenceId}`;
    const prev = bestByPair.get(key);
    if (!prev || m.matchScore > prev.matchScore) {
      bestByPair.set(key, m);
    }
  }

  return [...bestByPair.values()].sort((a, b) => b.matchScore - a.matchScore);
}
