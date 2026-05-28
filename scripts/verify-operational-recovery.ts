/**
 * V4-A3-R8 Operational Governance Recovery Runtime — verification
 */
import {
  buildGovernanceOrchestration,
  buildGovernanceLifecycle,
  buildGovernancePersistence,
  buildGovernanceStoreRuntime,
  buildGovernanceRecovery,
  GOVERNANCE_RECOVERY_VERSION,
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
  const deploymentId = "v4-verify-recovery";
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
  const store = buildGovernanceStoreRuntime({
    persistence,
    keyspace: deploymentId,
    backend: "memory",
  });
  const recovery = buildGovernanceRecovery({
    deploymentId,
    lifecycle,
    persistence,
    store,
  });

  assert(recovery.version === GOVERNANCE_RECOVERY_VERSION, "recovery version");
  assert(recovery.rollback.executed, "rollback executed");
  assert(recovery.replay.executed, "replay recovery executed");
  assert(recovery.partial.executed, "partial recovery executed");
  assert(typeof recovery.degraded.active === "boolean", "degraded evaluated");
  assert(recovery.audit.actions.length > 0, "recovery audit");
  assert(recovery.summary.text.length > 0, "recovery summary");
  assert(recovery.trace.length > 0, "recovery trace");

  console.log("✓ operational recovery runtime");
  console.log(" ", recovery.summary.text);
}

main();
