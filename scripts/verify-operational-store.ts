/**
 * V4-A3-R7 Operational Governance Store Runtime — verification
 */
import {
  buildGovernanceOrchestration,
  buildGovernanceLifecycle,
  buildGovernancePersistence,
  buildGovernanceStoreRuntime,
  GOVERNANCE_STORE_VERSION,
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
  const deploymentId = "v4-verify-store";
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

  assert(store.version === GOVERNANCE_STORE_VERSION, "store version");
  assert(store.backend === "memory", "default memory backend");
  assert(store.loaded.snapshot !== null, "snapshot load by id");
  assert(store.loaded.checkpoint !== null, "checkpoint load by id");
  assert(store.loaded.archive !== null, "archive load by id");
  assert(store.operations.length > 0, "store operations");
  assert(store.trace.operations.length > 0, "store trace");
  assert(store.summary.text.length > 0, "store summary");
  assert(store.registry.availableBackends.length >= 5, "store backend reserve");

  console.log("✓ operational store runtime");
  console.log(" ", store.summary.text);
}

main();
