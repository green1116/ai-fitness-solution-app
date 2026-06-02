/**
 * V4-A4-A4 Autonomous Recovery Orchestration Runtime — verification
 */
import { buildOperationalGovernanceRuntime } from "../lib/operations/governance";
import { buildOperationalAutonomousExecutionRuntime } from "../lib/operations/execution";
import { buildAutonomousChangeManagementRuntime } from "../lib/operations/change";
import { buildAutonomousIncidentManagementRuntime } from "../lib/operations/incident";
import {
  buildAutonomousRecoveryOrchestrationRuntime,
  AUTONOMOUS_RECOVERY_ORCHESTRATION_RUNTIME_VERSION,
  discoverRecoveryRequests,
  classifyRecoveryRequests,
  assessRecoveryRequests,
  buildRecoveryPlans,
  orchestrateRecoveryPlans,
  buildRecoveryTrackingBundle,
  computeRecoveryMetrics,
  buildRecoveryReport,
} from "../lib/operations/recovery";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const governance = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-autonomous-recovery-orchestration",
  });

  const execution = buildOperationalAutonomousExecutionRuntime({
    deploymentId: "v4-verify-autonomous-recovery-orchestration",
    mode: "simulation",
    autonomous: governance.governanceAutonomous,
    intelligence: governance.governanceIntelligence,
  });

  const change = buildAutonomousChangeManagementRuntime({
    deploymentId: "v4-verify-autonomous-recovery-orchestration",
    autonomous: governance.governanceAutonomous,
    execution,
  });

  const incident = buildAutonomousIncidentManagementRuntime({
    deploymentId: "v4-verify-autonomous-recovery-orchestration",
    intelligence: governance.governanceIntelligence,
    observability: governance.governanceFederationObservability,
    execution,
    change,
  });

  const runtime = buildAutonomousRecoveryOrchestrationRuntime({
    deploymentId: "v4-verify-autonomous-recovery-orchestration",
    intelligence: governance.governanceIntelligence,
    autonomous: governance.governanceAutonomous,
    execution,
    change,
    incident,
  });

  assert(
    runtime.version === AUTONOMOUS_RECOVERY_ORCHESTRATION_RUNTIME_VERSION,
    "recovery orchestration version",
  );
  assert(runtime.lifecycle.phases.length === 9, "recovery lifecycle phases");
  assert(runtime.requests.length > 0, "recovery requests");
  assert(runtime.classifications.length > 0, "classifications");
  assert(runtime.assessments.length > 0, "assessments");
  assert(runtime.plans.length > 0, "recovery plans");
  assert(runtime.orchestration.length > 0, "orchestration");
  assert(runtime.tracking.timelines.length > 0, "tracking timelines");
  assert(runtime.metrics.recoveries > 0, "recovery metrics");
  assert(runtime.report.summary.text.length > 0, "recovery report");
  assert(runtime.flags.classification, "classification flag");
  assert(runtime.flags.assessment, "assessment flag");
  assert(runtime.flags.planning, "planning flag");
  assert(runtime.flags.orchestration, "orchestration flag");
  assert(runtime.flags.tracking, "tracking flag");
  assert(runtime.flags.metrics, "metrics flag");
  assert(runtime.flags.reporting, "reporting flag");

  const requests = discoverRecoveryRequests({
    deploymentId: "unit-recovery",
    intelligence: governance.governanceIntelligence,
    autonomous: governance.governanceAutonomous,
    execution,
    change,
    incident,
  });
  assert(requests.length > 0, "unit requests");
  const classifications = classifyRecoveryRequests({ deploymentId: "unit-recovery", requests });
  assert(classifications.every((c) => c.category.length > 0), "unit classification");
  const assessments = assessRecoveryRequests({
    deploymentId: "unit-recovery",
    requests,
    intelligence: governance.governanceIntelligence,
    autonomous: governance.governanceAutonomous,
  });
  assert(assessments.every((a) => a.impact && a.risk && a.dependency), "unit assessment");
  const plans = buildRecoveryPlans({ deploymentId: "unit-recovery", requests, assessments });
  assert(plans.length > 0, "unit plans");
  assert(plans.some((p) => ["automatic", "manual", "staged"].includes(p.mode)), "unit recovery modes");
  const orchestration = orchestrateRecoveryPlans({
    deploymentId: "unit-recovery",
    plans,
    execution,
  });
  assert(orchestration.every((o) => o.containment.length > 0 && o.verification.length > 0), "unit orchestration chain");
  const tracking = buildRecoveryTrackingBundle({
    deploymentId: "unit-recovery",
    requests,
    plans,
    orchestrations: orchestration,
    lifecyclePhases: runtime.lifecycle.phases,
    execution,
  });
  assert(tracking.trace.events.length > 0, "unit tracking");
  const metrics = computeRecoveryMetrics({
    deploymentId: "unit-recovery",
    plans,
    orchestrations: orchestration,
    tracking,
  });
  assert(metrics.recoveries > 0, "unit metrics");
  const report = buildRecoveryReport({
    deploymentId: "unit-recovery",
    requests,
    assessments,
    metrics,
  });
  assert(report.riskProfile.profileId.length > 0, "unit report");

  console.log("✓ autonomous recovery orchestration runtime");
  console.log(" ", runtime.summary.text);
  console.log("");
  console.log("Autonomous Recovery Orchestration Runtime");
  console.log("PASS");
  console.log("");
  console.log(`classification=${runtime.flags.classification}`);
  console.log(`assessment=${runtime.flags.assessment}`);
  console.log(`planning=${runtime.flags.planning}`);
  console.log(`orchestration=${runtime.flags.orchestration}`);
  console.log(`tracking=${runtime.flags.tracking}`);
  console.log(`metrics=${runtime.flags.metrics}`);
  console.log(`reporting=${runtime.flags.reporting}`);
}

main();
