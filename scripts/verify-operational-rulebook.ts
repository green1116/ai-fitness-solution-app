/**
 * V4-A3-R2 Operational Governance Rulebook Runtime — verification
 */
import {
  loadGovernanceRulebook,
  buildGovernanceRulebookRegistry,
  buildGovernanceRulebookSnapshot,
  summarizeGovernanceRulebookEvaluation,
  evaluateGovernanceRulebook,
  adaptGovernanceCandidates,
  DEFAULT_RULEBOOK_VERSION,
} from "../lib/operations/governance";
import { buildV4OperationalIntelligenceRuntime } from "../lib/operations/intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const intelligence = buildV4OperationalIntelligenceRuntime({
    deploymentId: "v4-verify-rulebook-intelligence",
  });
  const rulebook = loadGovernanceRulebook();
  const registry = buildGovernanceRulebookRegistry({ rulebook });
  const snapshot = buildGovernanceRulebookSnapshot({ rulebook });
  const candidates = adaptGovernanceCandidates({
    deploymentId: "v4-verify-rulebook",
    intelligence,
  });
  const evaluation = evaluateGovernanceRulebook({ candidates, rulebook });
  const summary = summarizeGovernanceRulebookEvaluation({ evaluation, snapshot });

  assert(rulebook.version === DEFAULT_RULEBOOK_VERSION, "rulebook version");
  assert(registry.activeVersion === DEFAULT_RULEBOOK_VERSION, "registry active version");
  assert(rulebook.entries.length >= 7, "rulebook entries");
  assert(evaluation.matches.length >= 8, "rulebook matches");
  assert(evaluation.matches.some((m) => m.matched), "at least one rule matched");
  assert(summary.length > 0, "rulebook summary");
  assert(evaluation.governanceScore >= 0 && evaluation.governanceScore <= 100, "score range");
  assert(["low", "medium", "high"].includes(evaluation.governanceConfidence), "confidence range");

  console.log("✓ operational rulebook runtime");
  console.log(" ", summary);
}

main();
