import { buildDefaultGovernanceRulebook } from "./rulebook";
import { GOVERNANCE_RULEBOOK_VERSION, type GovernanceRulebook, type GovernanceRulebookVersion } from "./rulebook.types";

export function isGovernanceRulebookVersion(version: string): version is GovernanceRulebookVersion {
  return version === GOVERNANCE_RULEBOOK_VERSION;
}

export function validateGovernanceRulebook(rulebook: GovernanceRulebook): GovernanceRulebook {
  if (!isGovernanceRulebookVersion(rulebook.version)) {
    throw new Error(`Unsupported governance rulebook version: ${rulebook.version}`);
  }
  if (rulebook.entries.length === 0) {
    throw new Error("Governance rulebook must contain at least one entry.");
  }
  return rulebook;
}

/** Load built-in or externally supplied rulebook configuration. */
export function loadGovernanceRulebook(input?: {
  rulebook?: GovernanceRulebook;
}): GovernanceRulebook {
  const loaded = input?.rulebook ?? buildDefaultGovernanceRulebook();
  return validateGovernanceRulebook(loaded);
}
