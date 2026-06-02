/**
 * V4-A3-R3 Operational Governance Policy Pack Runtime — verification
 */
import {
  loadGovernancePolicyPacks,
  buildGovernancePolicyPackRegistry,
  buildGovernancePolicyPackSnapshot,
  summarizeGovernancePolicyPackEvaluation,
  evaluateGovernancePolicyPack,
  selectGovernancePolicyPack,
  adaptGovernanceCandidates,
  evaluateGovernanceRulebook,
  loadGovernanceRulebook,
  DEFAULT_POLICY_PACK_VERSION,
} from "../lib/operations/governance";
import { buildV4OperationalIntelligenceRuntime } from "../lib/operations/intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const deploymentId = "v4-verify-policy-pack";
  const intelligence = buildV4OperationalIntelligenceRuntime({
    deploymentId: `${deploymentId}-intelligence`,
  });
  const packs = loadGovernancePolicyPacks();
  const registry = buildGovernancePolicyPackRegistry({ packs });
  const selected = selectGovernancePolicyPack({ deploymentId, intelligence, packs });
  const candidates = adaptGovernanceCandidates({ deploymentId, intelligence });
  const rulebook = loadGovernanceRulebook();
  const rulebookEval = evaluateGovernanceRulebook({ candidates, rulebook });
  const evaluation = evaluateGovernancePolicyPack({
    deploymentId,
    intelligence,
    candidates,
    rulebookEvaluation: rulebookEval,
    packs,
  });
  const snapshot = buildGovernancePolicyPackSnapshot({ pack: selected, packs });
  const summary = summarizeGovernancePolicyPackEvaluation({ evaluation, snapshot });

  assert(packs.length >= 3, "policy packs loaded");
  assert(registry.defaultMode === "standard", "registry default mode");
  assert(selected.mode === "standard", "default pack mode for verify deployment");
  assert(evaluation.matches.length >= 3, "policy pack matches");
  assert(evaluation.traces.length >= 3, "policy pack traces");
  assert(summary.length > 0, "policy pack summary");
  assert(evaluation.governanceScore >= 0 && evaluation.governanceScore <= 100, "score range");
  assert(["low", "medium", "high"].includes(evaluation.governanceConfidence), "confidence range");
  assert(evaluation.version === DEFAULT_POLICY_PACK_VERSION, "policy pack version");

  const strictPack = selectGovernancePolicyPack({
    deploymentId: "prod-production-ops",
    intelligence,
    packs,
  });
  assert(strictPack.mode === "strict" || strictPack.mode === "standard", "production pack selection");

  const relaxedPack = selectGovernancePolicyPack({
    deploymentId: "internal-dev-sandbox",
    intelligence,
    packs,
  });
  assert(relaxedPack.mode === "relaxed", "internal relaxed pack");

  console.log("✓ operational policy pack runtime");
  console.log(" ", summary);
}

main();
