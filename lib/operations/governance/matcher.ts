import type {
  GovernanceActionCandidate,
  GovernanceRule,
  GovernanceRuleMatch,
  GovernanceRuleTrace,
} from "./types";
import { matchRulebookEntry } from "./rulebook.matcher";
import type { GovernanceRulebookEntry } from "./rulebook.types";

export function matchGovernanceRule(
  rule: GovernanceRule,
  candidates: GovernanceActionCandidate[],
): { match: GovernanceRuleMatch; trace: GovernanceRuleTrace } {
  const compatibilityEntry: GovernanceRulebookEntry = {
    ruleId: rule.ruleId,
    ruleName: rule.ruleName,
    category: rule.ruleCategory,
    enabled: rule.enabled,
    priority: rule.priority,
    severity: rule.severity,
    description: rule.ruleName,
    rationale: rule.rationale,
    triggerReason: rule.rationale,
    triggers: [
      { field: "kind", scope: "any", threshold: { type: "level", allowed: ["low", "medium", "high", "critical"] } },
    ],
    actions: [],
  };
  const matched = matchRulebookEntry(compatibilityEntry, candidates);
  return {
    match: {
      ruleId: matched.ruleId,
      matched: matched.matched,
      reason: matched.reason,
      candidateIds: matched.candidateIds,
    },
    trace: {
      traceId: `trace-rule-${rule.ruleId}`,
      ruleId: rule.ruleId,
      matched: matched.matched,
      reason: matched.reason,
      evidence: matched.candidateIds,
    },
  };
}
