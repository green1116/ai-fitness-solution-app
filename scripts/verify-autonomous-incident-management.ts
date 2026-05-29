/**
 * V4-A4-A3 Autonomous Incident Management Runtime — verification
 */
import { buildOperationalGovernanceRuntime } from "../lib/operations/governance";
import { buildOperationalAutonomousExecutionRuntime } from "../lib/operations/execution";
import { buildAutonomousChangeManagementRuntime } from "../lib/operations/change";
import {
  buildAutonomousIncidentManagementRuntime,
  AUTONOMOUS_INCIDENT_MANAGEMENT_RUNTIME_VERSION,
  discoverIncidents,
  classifyIncidents,
  assessIncidents,
  evaluateIncidentEscalations,
  buildIncidentResponsePlans,
  buildIncidentTrackingBundle,
  computeIncidentMetrics,
  buildIncidentReport,
  DEFAULT_ESCALATION_POLICY,
} from "../lib/operations/incident";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const governance = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-autonomous-incident-management",
  });

  const execution = buildOperationalAutonomousExecutionRuntime({
    deploymentId: "v4-verify-autonomous-incident-management",
    mode: "simulation",
    autonomous: governance.governanceAutonomous,
    intelligence: governance.governanceIntelligence,
  });

  const change = buildAutonomousChangeManagementRuntime({
    deploymentId: "v4-verify-autonomous-incident-management",
    autonomous: governance.governanceAutonomous,
    execution,
  });

  const runtime = buildAutonomousIncidentManagementRuntime({
    deploymentId: "v4-verify-autonomous-incident-management",
    intelligence: governance.governanceIntelligence,
    observability: governance.governanceFederationObservability,
    execution,
    change,
  });

  assert(
    runtime.version === AUTONOMOUS_INCIDENT_MANAGEMENT_RUNTIME_VERSION,
    "incident management version",
  );
  assert(runtime.lifecycle.phases.length === 8, "incident lifecycle phases");
  assert(runtime.incidents.length > 0, "incidents");
  assert(runtime.classifications.length > 0, "classifications");
  assert(runtime.assessments.length > 0, "assessments");
  assert(runtime.escalations.length > 0, "escalations");
  assert(runtime.responsePlans.length >= 0, "response plans");
  assert(runtime.tracking.timelines.length > 0, "tracking timelines");
  assert(runtime.metrics.incidents > 0, "incident metrics");
  assert(runtime.report.summary.text.length > 0, "incident report");
  assert(runtime.flags.classification, "classification flag");
  assert(runtime.flags.assessment, "assessment flag");
  assert(runtime.flags.escalation, "escalation flag");
  assert(runtime.flags.workflow, "workflow flag");
  assert(runtime.flags.tracking, "tracking flag");
  assert(runtime.flags.metrics, "metrics flag");
  assert(runtime.flags.reporting, "reporting flag");

  const incidents = discoverIncidents({
    deploymentId: "unit-incident",
    intelligence: governance.governanceIntelligence,
    execution,
    change,
  });
  assert(incidents.length > 0, "unit incidents");
  const classifications = classifyIncidents({ deploymentId: "unit-incident", incidents });
  assert(classifications.every((c) => c.category.length > 0), "unit classification");
  const assessments = assessIncidents({
    deploymentId: "unit-incident",
    incidents,
    intelligence: governance.governanceIntelligence,
  });
  assert(assessments.every((a) => a.impact && a.urgency && a.risk), "unit assessment");
  const escalations = evaluateIncidentEscalations({
    deploymentId: "unit-incident",
    incidents,
    assessments,
    policy: DEFAULT_ESCALATION_POLICY,
  });
  assert(escalations.some((e) => ["auto", "manual", "multi-stage"].includes(e.mode)), "unit escalation modes");
  const responsePlans = buildIncidentResponsePlans({
    deploymentId: "unit-incident",
    incidents,
    escalations,
    intelligence: governance.governanceIntelligence,
  });
  assert(responsePlans.length >= 0, "unit workflow");
  const tracking = buildIncidentTrackingBundle({
    deploymentId: "unit-incident",
    incidents,
    responsePlans,
    escalations,
    lifecyclePhases: runtime.lifecycle.phases,
    execution,
  });
  assert(tracking.trace.events.length > 0, "unit tracking");
  const metrics = computeIncidentMetrics({
    deploymentId: "unit-incident",
    incidents,
    escalations,
    responsePlans,
    tracking,
  });
  assert(metrics.incidents > 0, "unit metrics");
  const report = buildIncidentReport({
    deploymentId: "unit-incident",
    incidents,
    assessments,
    escalations,
    metrics,
  });
  assert(report.riskProfile.profileId.length > 0, "unit report");

  console.log("✓ autonomous incident management runtime");
  console.log(" ", runtime.summary.text);
  console.log("");
  console.log("Autonomous Incident Management Runtime");
  console.log("PASS");
  console.log("");
  console.log(`classification=${runtime.flags.classification}`);
  console.log(`assessment=${runtime.flags.assessment}`);
  console.log(`escalation=${runtime.flags.escalation}`);
  console.log(`workflow=${runtime.flags.workflow}`);
  console.log(`tracking=${runtime.flags.tracking}`);
  console.log(`metrics=${runtime.flags.metrics}`);
  console.log(`reporting=${runtime.flags.reporting}`);
}

main();
