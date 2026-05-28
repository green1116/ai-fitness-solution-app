import type { GovernanceActionCandidate } from "./types";
import { loadGovernanceRulebook } from "./rulebook.loader";
import { matchRulebookEntry } from "./rulebook.matcher";
import type {
  GovernanceRulebook,
  GovernanceRulebookAction,
  GovernanceRulebookConflictResolution,
  GovernanceRulebookEvaluation,
  GovernanceRulebookMatch,
} from "./rulebook.types";

function toConfidence(score: number): "low" | "medium" | "high" {
  if (score >= 85) return "high";
  if (score >= 65) return "medium";
  return "low";
}

function resolveRulebookConflicts(
  entries: GovernanceRulebook["entries"],
  matches: GovernanceRulebookMatch[],
): GovernanceRulebookConflictResolution[] {
  const matched = matches.filter((m) => m.matched);
  const byTarget = new Map<GovernanceRulebookAction["to"], GovernanceRulebookMatch[]>();

  for (const match of matched) {
    for (const action of match.actions) {
      const list = byTarget.get(action.to) ?? [];
      list.push(match);
      byTarget.set(action.to, list);
    }
  }

  const resolutions: GovernanceRulebookConflictResolution[] = [];
  for (const [actionTarget, group] of byTarget) {
    const unique = [...new Map(group.map((m) => [m.ruleId, m])).values()];
    if (unique.length <= 1) continue;

    const priorityOf = (ruleId: string): number =>
      entries.find((entry) => entry.ruleId === ruleId)?.priority ?? 0;

    const sorted = [...unique].sort((a, b) => priorityOf(b.ruleId) - priorityOf(a.ruleId));
    const winner = sorted[0];
    const suppressedRuleIds = sorted.slice(1).map((m) => m.ruleId);
    resolutions.push({
      actionTarget,
      winningRuleId: winner.ruleId,
      suppressedRuleIds,
      reason: `Higher priority rule wins for ${actionTarget}.`,
    });
  }

  return resolutions;
}

export function evaluateGovernanceRulebook(input: {
  candidates: GovernanceActionCandidate[];
  rulebook?: GovernanceRulebook;
}): GovernanceRulebookEvaluation {
  const book = loadGovernanceRulebook({ rulebook: input.rulebook });
  const entries = book.entries
    .filter((entry) => entry.enabled)
    .sort((a, b) => b.priority - a.priority);

  const matches: GovernanceRulebookMatch[] = entries.map((entry) =>
    matchRulebookEntry(entry, input.candidates),
  );
  const conflictResolutions = resolveRulebookConflicts(book.entries, matches);
  const matchedCount = matches.filter((m) => m.matched).length;
  const score = Math.max(0, Math.min(100, Math.round((matchedCount / Math.max(entries.length, 1)) * 100)));
  const avgConfidence = Math.round(
    input.candidates.reduce((sum, c) => sum + c.confidence, 0) / Math.max(input.candidates.length, 1),
  );

  return {
    version: book.version,
    matches,
    conflictResolutions,
    governanceScore: score,
    governanceConfidence: toConfidence(avgConfidence),
  };
}
