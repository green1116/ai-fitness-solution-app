import { loadGovernanceRulebook } from "./rulebook.loader";
import type { GovernanceRulebook, GovernanceRulebookRegistry } from "./rulebook.types";

export function buildGovernanceRulebookRegistry(input?: {
  rulebook?: GovernanceRulebook;
}): GovernanceRulebookRegistry {
  const active = loadGovernanceRulebook(input);
  return {
    loadedAt: new Date().toISOString(),
    rulebooks: [active],
    activeVersion: active.version,
  };
}
