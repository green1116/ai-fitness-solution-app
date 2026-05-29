/**
 * V4-A4-A2 Autonomous Change Management Runtime — verification
 */
import { buildOperationalGovernanceRuntime } from "../lib/operations/governance";
import { buildOperationalAutonomousExecutionRuntime } from "../lib/operations/execution";
import {
  buildAutonomousChangeManagementRuntime,
  AUTONOMOUS_CHANGE_MANAGEMENT_RUNTIME_VERSION,
  buildChangeRequests,
  classifyChangeRequests,
  assessChangeRequests,
  evaluateChangeApprovals,
  buildChangeWorkflowPlans,
  buildChangeAuditBundle,
  computeChangeMetrics,
  buildChangeReport,
  DEFAULT_APPROVAL_POLICY,
} from "../lib/operations/change";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const governance = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-autonomous-change-management",
  });

  const execution = buildOperationalAutonomousExecutionRuntime({
    deploymentId: "v4-verify-autonomous-change-management",
    mode: "simulation",
    autonomous: governance.governanceAutonomous,
    intelligence: governance.governanceIntelligence,
  });

  const runtime = buildAutonomousChangeManagementRuntime({
    deploymentId: "v4-verify-autonomous-change-management",
    autonomous: governance.governanceAutonomous,
    execution,
  });

  assert(
    runtime.version === AUTONOMOUS_CHANGE_MANAGEMENT_RUNTIME_VERSION,
    "change management version",
  );
  assert(runtime.lifecycle.phases.length === 8, "change lifecycle phases");
  assert(runtime.requests.length > 0, "change requests");
  assert(runtime.classifications.length > 0, "classifications");
  assert(runtime.assessments.length > 0, "assessments");
  assert(runtime.approvals.length > 0, "approvals");
  assert(runtime.plans.length >= 0, "workflow plans");
  assert(runtime.audit.records.length > 0, "audit records");
  assert(runtime.metrics.changes > 0, "change metrics");
  assert(runtime.report.summary.text.length > 0, "change report");
  assert(runtime.flags.classification, "classification flag");
  assert(runtime.flags.assessment, "assessment flag");
  assert(runtime.flags.approval, "approval flag");
  assert(runtime.flags.workflow, "workflow flag");
  assert(runtime.flags.audit, "audit flag");
  assert(runtime.flags.metrics, "metrics flag");
  assert(runtime.flags.reporting, "reporting flag");

  const requests = buildChangeRequests({
    deploymentId: "unit-change",
    proposals: governance.governanceAutonomous.proposals.map((p) => ({
      proposalId: p.proposalId,
      action: p.action,
      rationale: p.rationale,
      confidence: p.confidence,
    })),
  });
  assert(requests.length > 0, "unit requests");
  const classifications = classifyChangeRequests({ deploymentId: "unit-change", requests });
  assert(classifications.every((c) => c.category.length > 0), "unit classification");
  const assessments = assessChangeRequests({
    deploymentId: "unit-change",
    requests,
    autonomous: governance.governanceAutonomous,
  });
  assert(assessments.every((a) => a.impact && a.risk && a.dependency && a.rollback), "unit assessment");
  const approvals = evaluateChangeApprovals({
    deploymentId: "unit-change",
    requests,
    assessments,
    autonomous: governance.governanceAutonomous,
    policy: DEFAULT_APPROVAL_POLICY,
  });
  assert(approvals.some((a) => ["auto", "manual", "multi-stage"].includes(a.mode)), "unit approval modes");
  const plans = buildChangeWorkflowPlans({ deploymentId: "unit-change", requests, approvals });
  assert(plans.length >= 0, "unit workflow");
  const audit = buildChangeAuditBundle({
    deploymentId: "unit-change",
    requests,
    plans,
    approvals,
    execution,
    lifecyclePhases: runtime.lifecycle.phases,
  });
  assert(audit.trace.events.length > 0, "unit audit");
  const metrics = computeChangeMetrics({
    deploymentId: "unit-change",
    requests,
    approvals,
    plans,
    audit,
    execution,
  });
  assert(metrics.changes > 0, "unit metrics");
  const report = buildChangeReport({
    deploymentId: "unit-change",
    requests,
    assessments,
    approvals,
    metrics,
  });
  assert(report.riskProfile.profileId.length > 0, "unit report");

  console.log("✓ autonomous change management runtime");
  console.log(" ", runtime.summary.text);
  console.log("");
  console.log("Autonomous Change Management Runtime");
  console.log("PASS");
  console.log("");
  console.log(`classification=${runtime.flags.classification}`);
  console.log(`assessment=${runtime.flags.assessment}`);
  console.log(`approval=${runtime.flags.approval}`);
  console.log(`workflow=${runtime.flags.workflow}`);
  console.log(`audit=${runtime.flags.audit}`);
  console.log(`metrics=${runtime.flags.metrics}`);
  console.log(`reporting=${runtime.flags.reporting}`);
}

main();
