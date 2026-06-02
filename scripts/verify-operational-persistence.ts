/**
 * V4-A3-R6 Operational Governance Persistence Runtime — verification
 */
import {
  buildGovernanceOrchestration,
  buildGovernanceLifecycle,
  buildGovernancePersistence,
  GOVERNANCE_PERSISTENCE_VERSION,
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
  const deploymentId = "v4-verify-persistence";
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
  const persistence = buildGovernancePersistence({
    runtimeName: "V4-A3 Operational Governance Runtime",
    runtimeVersion: "4-a3-operational-governance-1",
    inputSnapshot: {
      deploymentId,
      intelligenceRuntimeId: intelligence.runtimeId,
      intelligenceSummary: intelligence.summary.summary,
    },
    rulebookVersion: rulebook.version,
    policyPackVersion: packs[0]?.version ?? "v4-a3-r3-policy-pack-1",
    policyPackMode: policyPackEvaluation.mode,
    orchestration,
    lifecycle,
    summaryText: lifecycle.summary.text,
  });

  assert(persistence.version === GOVERNANCE_PERSISTENCE_VERSION, "persistence version");
  assert(persistence.snapshot.snapshotId.length > 0, "snapshot generated");
  assert(persistence.checkpoint.checkpointId.length > 0, "checkpoint generated");
  assert(persistence.checkpoint.checkpointHash.length > 0, "checkpoint hash");
  assert(persistence.restore.restored, "restore executable");
  assert(persistence.replay.replayable, "replay executable");
  assert(persistence.metadata.schemaVersion.length > 0, "metadata exists");
  assert(persistence.summary.text.length > 0, "persistence summary");
  assert(persistence.snapshot.snapshotVersion.length > 0, "snapshot versioned");
  assert(persistence.checkpoint.checkpointVersion.length > 0, "checkpoint versioned");
  assert(persistence.restore.auditNote.includes("hash"), "restore audit note");

  console.log("✓ operational persistence runtime");
  console.log(" ", persistence.summary.text);
}

main();
