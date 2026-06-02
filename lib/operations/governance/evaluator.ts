import { loadGovernanceRulebook } from "./rulebook.loader";
import { evaluateGovernanceRulebook } from "./rulebook.evaluator";
import type {
  GovernanceActionCandidate,
  GovernanceRuleEvaluation,
} from "./types";

export function evaluateGovernanceRules(
  candidates: GovernanceActionCandidate[],
): GovernanceRuleEvaluation {
  const legacyRules = loadGovernanceRulebook().entries.map((entry) => ({
    ruleId: entry.ruleId,
    ruleName: entry.ruleName,
    ruleCategory: entry.category,
    enabled: entry.enabled,
    priority: entry.priority,
    severity: entry.severity,
    rationale: entry.rationale,
    triggers: entry.triggers.map((trigger) => `${trigger.scope}.${trigger.field}`),
  }));
  const governanceRules = {
    version: loadGovernanceRulebook().version,
    rules: legacyRules.filter((rule) => rule.enabled).sort((a, b) => b.priority - a.priority),
  };
  const rulebookEval = evaluateGovernanceRulebook({ candidates, rulebook: loadGovernanceRulebook() });
  const matchedRules = rulebookEval.matches
    .filter((match) => match.matched)
    .map((match) => ({
      ruleId: match.ruleId,
      matched: match.matched,
      reason: match.reason,
      candidateIds: match.candidateIds,
    }));
  const unmatchedRules = rulebookEval.matches
    .filter((match) => !match.matched)
    .map((match) => ({
      ruleId: match.ruleId,
      matched: match.matched,
      reason: match.reason,
      candidateIds: match.candidateIds,
    }));
  const ruleTrace = rulebookEval.matches.map((match) => ({
    traceId: `trace-rule-${match.ruleId}`,
    ruleId: match.ruleId,
    matched: match.matched,
    reason: match.reason,
    evidence: match.candidateIds,
  }));
  const triggeredControls: string[] = [];
  const triggeredApprovals: string[] = [];
  const triggeredEscalations: string[] = [];
  const triggeredExceptions: string[] = [];

  for (const match of rulebookEval.matches.filter((item) => item.matched)) {
    for (const action of match.actions) {
      if (action.to === "controls") triggeredControls.push(match.ruleId);
      if (action.to === "approvals") triggeredApprovals.push(match.ruleId);
      if (action.to === "escalation") triggeredEscalations.push(match.ruleId);
      if (action.to === "exceptions") triggeredExceptions.push(match.ruleId);
    }
  }

  return {
    governanceRules,
    matchedRules,
    unmatchedRules,
    triggeredControls,
    triggeredApprovals,
    triggeredEscalations,
    triggeredExceptions,
    governanceScore: rulebookEval.governanceScore,
    governanceConfidence: rulebookEval.governanceConfidence,
    ruleTrace,
  };
}
