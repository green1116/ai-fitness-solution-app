import { GOVERNANCE_RULEBOOK_VERSION } from "./rulebook.types";
import { loadGovernanceRulebook } from "./rulebook.loader";
import type {
  GovernanceRulebook,
  GovernanceRulebookCategory,
  GovernanceRulebookEvaluation,
  GovernanceRulebookSnapshot,
} from "./rulebook.types";

export function buildGovernanceRulebookSnapshot(input?: {
  rulebook?: GovernanceRulebook;
}): GovernanceRulebookSnapshot {
  const rulebook = loadGovernanceRulebook(input);
  const enabledEntries = rulebook.entries.filter((entry) => entry.enabled);
  const categories: GovernanceRulebookCategory[] = [
    "policy",
    "action",
    "approval",
    "escalation",
    "exception",
    "control",
    "audit",
    "summary",
  ];
  const categoryCounts = Object.fromEntries(
    categories.map((category) => [
      category,
      enabledEntries.filter((entry) => entry.category === category).length,
    ]),
  ) as Record<GovernanceRulebookCategory, number>;

  return {
    rulebookId: rulebook.rulebookId,
    version: rulebook.version,
    enabledRuleCount: enabledEntries.length,
    categoryCounts,
  };
}

export function summarizeGovernanceRulebookEvaluation(input: {
  evaluation: GovernanceRulebookEvaluation;
  snapshot: GovernanceRulebookSnapshot;
}): string {
  const matched = input.evaluation.matches.filter((m) => m.matched).length;
  const conflicts = input.evaluation.conflictResolutions.length;
  return [
    `rulebookVersion=${input.snapshot.version}`,
    `enabledRules=${input.snapshot.enabledRuleCount}`,
    `matched=${matched}`,
    `conflicts=${conflicts}`,
    `score=${input.evaluation.governanceScore}`,
    `confidence=${input.evaluation.governanceConfidence}`,
  ].join(" ");
}

export const DEFAULT_RULEBOOK_VERSION = GOVERNANCE_RULEBOOK_VERSION;
