import type { GovernanceRule } from "./types";
import { loadGovernanceRulebook } from "./rulebook.loader";

export function buildBaseGovernanceRules(): GovernanceRule[] {
  const rulebook = loadGovernanceRulebook();
  return rulebook.entries.map((entry) => ({
    ruleId: entry.ruleId,
    ruleName: entry.ruleName,
    ruleCategory: entry.category,
    enabled: entry.enabled,
    priority: entry.priority,
    severity: entry.severity,
    rationale: entry.rationale,
    triggers: entry.triggers.map((trigger) => `${trigger.scope}.${trigger.field}`),
  }));
}
