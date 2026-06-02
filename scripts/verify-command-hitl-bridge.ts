/**
 * V4-A5-A3 HITL–Bridge Coordination Runtime — verification
 */
import { buildOperationalGovernanceRuntime } from "../lib/operations/governance";
import { buildOperationalAutonomousExecutionRuntime } from "../lib/operations/execution";
import { buildAutonomousChangeManagementRuntime } from "../lib/operations/change";
import { buildAutonomousIncidentManagementRuntime } from "../lib/operations/incident";
import { buildAutonomousRecoveryOrchestrationRuntime } from "../lib/operations/recovery";
import { buildAutonomousOperationsCenterRuntime } from "../lib/operations/center";
import { buildAutonomousCommandRuntime } from "../lib/operations/command";
import { buildHumanInTheLoopCommandRuntime } from "../lib/operations/command/hitl";
import { buildAutonomousCommandExecutionRuntime } from "../lib/operations/command/bridge";
import {
  HITL_BRIDGE_COORDINATION_VERSION,
  buildHITLBridgeCoordinationRuntime,
  evaluateBridgeEligibility,
  evaluateDispatchReadiness,
  admitToExecutionBridge,
  blockFromExecutionBridge,
  buildBridgeGate,
  resolveAdmissionDecisions,
} from "../lib/operations/command/hitl-bridge";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const deploymentId = "v4-verify-command-hitl-bridge";
  const governance = buildOperationalGovernanceRuntime({ deploymentId });

  const execution = buildOperationalAutonomousExecutionRuntime({
    deploymentId,
    mode: "simulation",
    autonomous: governance.governanceAutonomous,
    intelligence: governance.governanceIntelligence,
  });

  const change = buildAutonomousChangeManagementRuntime({
    deploymentId,
    autonomous: governance.governanceAutonomous,
    execution,
  });

  const incident = buildAutonomousIncidentManagementRuntime({
    deploymentId,
    intelligence: governance.governanceIntelligence,
    observability: governance.governanceFederationObservability,
    execution,
    change,
  });

  const recovery = buildAutonomousRecoveryOrchestrationRuntime({
    deploymentId,
    intelligence: governance.governanceIntelligence,
    autonomous: governance.governanceAutonomous,
    execution,
    change,
    incident,
  });

  const operations = buildAutonomousOperationsCenterRuntime({
    deploymentId,
    execution,
    change,
    incident,
    recovery,
  });

  const command = buildAutonomousCommandRuntime({
    deploymentId,
    operations,
    execution,
    change,
    incident,
    recovery,
  });

  const hitl = buildHumanInTheLoopCommandRuntime({
    deploymentId,
    command,
    defaultReviewer: "verify-operator",
  });

  const bridge = buildAutonomousCommandExecutionRuntime({
    deploymentId,
    command,
    execution,
    change,
    incident,
    recovery,
  });

  const runtime = buildHITLBridgeCoordinationRuntime({
    deploymentId,
    command,
    hitl,
    bridge,
  });

  assert(runtime.version === HITL_BRIDGE_COORDINATION_VERSION, "coordination version");
  assert(runtime.eligibilityProfiles.length === command.intents.length, "eligibility profiles");
  assert(runtime.admissionDecisions.length === command.intents.length, "admission decisions");
  assert(runtime.gate.gateId.includes(deploymentId), "bridge gate");
  assert(runtime.dispatchReadiness.length === command.intents.length, "dispatch readiness");
  assert(runtime.admissionAudit.length > 0, "admission audit");
  assert(runtime.admittedIntentIds.length > 0, "admitted intents");
  assert(runtime.flags.eligibility, "eligibility flag");
  assert(runtime.flags.gate, "gate flag");
  assert(runtime.flags.audit, "audit flag");

  const sampleIntent = command.intents[0]!;
  const profile = evaluateBridgeEligibility({
    deploymentId,
    intent: sampleIntent,
    command,
    hitl,
  });
  assert(profile.intentId === sampleIntent.intentId, "evaluateBridgeEligibility");

  const admissions = resolveAdmissionDecisions({
    deploymentId,
    profiles: runtime.eligibilityProfiles,
  });
  const gate = buildBridgeGate({ deploymentId, command, admissionDecisions: admissions });
  assert(gate.state === "open" || gate.state === "partial", "buildBridgeGate");

  const admission = admissions.find((a) => a.intentId === sampleIntent.intentId)!;
  const readiness = evaluateDispatchReadiness({
    deploymentId,
    profile,
    admission,
    bridge,
  });
  assert(readiness.intentId === sampleIntent.intentId, "evaluateDispatchReadiness");

  const eligibleProfile =
    runtime.eligibilityProfiles.find((p) => p.eligible) ?? profile;
  const admitted = admitToExecutionBridge({ deploymentId, profile: eligibleProfile });
  assert(admitted.outcome === "admit", "admitToExecutionBridge");

  const blockedProfile = runtime.eligibilityProfiles.find((p) => !p.eligible);
  if (blockedProfile) {
    const blocked = blockFromExecutionBridge({ deploymentId, profile: blockedProfile });
    assert(blocked.outcome === "block", "blockFromExecutionBridge");
  }

  const approvedProfiles = runtime.eligibilityProfiles.filter(
    (p) => p.reason === "approved" || p.reason === "overridden" || p.reason === "auto-cleared",
  );
  const rejectedProfiles = runtime.eligibilityProfiles.filter(
    (p) => p.reason === "rejected" || p.reason === "cancelled" || p.reason === "suspended",
  );

  console.log("HITL-Bridge Coordination Runtime");
  console.log("PASS");
  console.log(`version=${runtime.version}`);
  console.log(`status=${runtime.status}`);
  console.log(`gateState=${runtime.gate.state}`);
  console.log(`summary=${runtime.summary.text}`);
  console.log(`admitted=${runtime.admittedIntentIds.length}`);
  console.log(`blocked=${runtime.blockedIntentIds.length}`);
  console.log(`eligible=${runtime.eligibilityProfiles.filter((p) => p.eligible).length}`);
  console.log(`ready=${runtime.dispatchReadiness.filter((r) => r.status === "ready").length}`);
  console.log(`partial=${runtime.dispatchReadiness.filter((r) => r.status === "partial").length}`);
  console.log(`auditRecords=${runtime.admissionAudit.length}`);
  console.log(`approvedProfiles=${approvedProfiles.length}`);
  console.log(`rejectedProfiles=${rejectedProfiles.length}`);
  console.log(`openDomains=${runtime.gate.openDomains.join(",")}`);
}

main();
