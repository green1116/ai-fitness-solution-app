import { buildBaseGovernanceRules } from "./rules";
import type { GovernanceRuleRegistry } from "./types";
import { buildGovernanceRulebookRegistry } from "./rulebook.registry";

export function buildGovernanceRuleRegistry(): GovernanceRuleRegistry {
  const rulebookRegistry = buildGovernanceRulebookRegistry();
  const rules = buildBaseGovernanceRules()
    .filter((r) => r.enabled)
    .sort((a, b) => b.priority - a.priority);
  return {
    version: rulebookRegistry.activeVersion,
    rules,
  };
}
