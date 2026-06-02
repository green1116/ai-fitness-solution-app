/**
 * V4-A3-R4 Operational Governance Orchestration Runtime — verification
 */
import {
  buildGovernanceOrchestration,
  GOVERNANCE_ORCHESTRATION_VERSION,
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
  const deploymentId = "v4-verify-orchestration";
  const intelligence = buildV4OperationalIntelligenceRuntime({
    deploymentId: `${deploymentId}-intelligence`,
  });
  const candidates = adaptGovernanceCandidates({ deploymentId, intelligence });
  const rulebook = loadGovernanceRulebook();
  const rulebookEval = evaluateGovernanceRulebook({ candidates, rulebook });
  const packs = loadGovernancePolicyPacks();
  const packEval = evaluateGovernancePolicyPack({
    deploymentId,
    intelligence,
    candidates,
    rulebookEvaluation: rulebookEval,
    packs,
  });

  const orchestration = buildGovernanceOrchestration({
    deploymentId,
    observedAt: new Date().toISOString(),
    policyPackMode: packEval.mode,
    ruleEvaluation: packEval.adjustedRuleEvaluation,
    rulebookEvaluation: rulebookEval,
    policyPackEvaluation: packEval,
  });

  assert(orchestration.version === GOVERNANCE_ORCHESTRATION_VERSION, "orchestration version");
  assert(orchestration.plan.steps.length > 0, "orchestration plan steps");
  assert(orchestration.state.totalSteps > 0, "orchestration state total steps");
  assert(orchestration.timeline.entries.length > 0, "orchestration timeline");
  assert(Array.isArray(orchestration.conflicts), "orchestration conflicts array");
  assert(orchestration.summary.text.length > 0, "orchestration summary");
  assert(orchestration.queue.length > 0, "orchestration queue");
  assert(orchestration.timeline.entries.some((e) => e.status === "escalated" || e.status === "audited"), "timeline status coverage");

  const stressedCandidates = [
    ...candidates,
    {
      candidateId: "cand-rec-orch-stress",
      kind: "recommendation" as const,
      refId: "rec-orch",
      priority: "critical" as const,
      confidence: 50,
      title: "Critical remediation",
      evidence: ["a", "b", "c"],
    },
  ];
  const stressedPackEval = evaluateGovernancePolicyPack({
    deploymentId,
    intelligence,
    candidates: stressedCandidates,
    rulebookEvaluation: evaluateGovernanceRulebook({
      candidates: stressedCandidates,
      rulebook,
    }),
    packs,
  });
  const stressedOrch = buildGovernanceOrchestration({
    deploymentId: `${deploymentId}-stress`,
    observedAt: new Date().toISOString(),
    policyPackMode: stressedPackEval.mode,
    ruleEvaluation: stressedPackEval.adjustedRuleEvaluation,
    rulebookEvaluation: evaluateGovernanceRulebook({
      candidates: stressedCandidates,
      rulebook,
    }),
    policyPackEvaluation: stressedPackEval,
  });
  const escalateFirst = stressedOrch.plan.steps[0]?.action === "escalate";
  const hasManualReview = stressedOrch.plan.steps.some((s) => s.action === "manualReview");
  assert(escalateFirst || hasManualReview, "high severity / escalation ordering");

  console.log("✓ operational orchestration runtime");
  console.log(" ", orchestration.summary.text);
}

main();
