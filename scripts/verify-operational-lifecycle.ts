/**
 * V4-A3-R5 Operational Governance Lifecycle Runtime — verification
 */
import {
  GOVERNANCE_LIFECYCLE_VERSION,
  buildGovernanceLifecycle,
  buildGovernanceOrchestration,
  adaptGovernanceCandidates,
  evaluateGovernanceRulebook,
  evaluateGovernancePolicyPack,
  loadGovernanceRulebook,
  loadGovernancePolicyPacks,
} from "../lib/operations/governance";
import { buildV4OperationalIntelligenceRuntime } from "../lib/operations/intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const deploymentId = "v4-verify-lifecycle";
  const intelligence = buildV4OperationalIntelligenceRuntime({
    deploymentId: `${deploymentId}-intelligence`,
  });
  const candidates = adaptGovernanceCandidates({ deploymentId, intelligence });
  const rulebook = loadGovernanceRulebook();
  const rulebookEvaluation = evaluateGovernanceRulebook({ candidates, rulebook });
  const packs = loadGovernancePolicyPacks();
  const policyPackEvaluation = evaluateGovernancePolicyPack({
    deploymentId,
    intelligence,
    candidates,
    rulebookEvaluation,
    packs,
  });
  const orchestration = buildGovernanceOrchestration({
    deploymentId,
    observedAt: new Date().toISOString(),
    policyPackMode: policyPackEvaluation.mode,
    ruleEvaluation: policyPackEvaluation.adjustedRuleEvaluation,
    rulebookEvaluation,
    policyPackEvaluation,
  });
  const lifecycle = buildGovernanceLifecycle({
    deploymentId,
    observedAt: new Date().toISOString(),
    orchestration,
  });

  assert(lifecycle.version === GOVERNANCE_LIFECYCLE_VERSION, "lifecycle version");
  assert(lifecycle.state.status.length > 0, "lifecycle state");
  assert(lifecycle.transitions.length > 0, "lifecycle transitions");
  assert(lifecycle.retries.length >= 0, "lifecycle retries record");
  assert(lifecycle.replay.supported, "lifecycle replay");
  assert(lifecycle.archive.archiveId.length > 0, "lifecycle archive");
  assert(lifecycle.snapshots.length > 0, "lifecycle snapshots");
  assert(lifecycle.summary.text.length > 0, "lifecycle summary");
  assert(lifecycle.transitions.some((t) => t.to === "archived"), "archive transition");

  console.log("✓ operational lifecycle runtime");
  console.log(" ", lifecycle.summary.text);
}

main();
