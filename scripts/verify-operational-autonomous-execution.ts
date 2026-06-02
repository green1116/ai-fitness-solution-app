/**
 * V4-A4-A1 Operational Autonomous Execution Runtime — verification
 */
import { buildOperationalGovernanceRuntime } from "../lib/operations/governance";
import {
  buildOperationalAutonomousExecutionRuntime,
  OPERATIONAL_AUTONOMOUS_EXECUTION_RUNTIME_VERSION,
  buildExecutionCandidates,
  buildExecutionPlan,
  runExecutionSafetyGate,
  executePlan,
  executeStep,
  executeAction,
  buildRollbackPlan,
  executeRollback,
  buildExecutionAuditBundle,
  computeExecutionMetrics,
  buildExecutionReport,
} from "../lib/operations/execution";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  const governance = buildOperationalGovernanceRuntime({
    deploymentId: "v4-verify-operational-autonomous-execution",
  });

  const runtime = buildOperationalAutonomousExecutionRuntime({
    deploymentId: "v4-verify-operational-autonomous-execution",
    mode: "dry-run",
    autonomous: governance.governanceAutonomous,
    intelligence: governance.governanceIntelligence,
  });

  assert(
    runtime.version === OPERATIONAL_AUTONOMOUS_EXECUTION_RUNTIME_VERSION,
    "execution runtime version",
  );
  assert(runtime.loop.phases.length === 7, "autonomous loop phases");
  assert(runtime.candidates.length > 0, "execution candidates");
  assert(runtime.plan.steps.length > 0, "execution plan");
  assert(runtime.plan.dependencies.length >= 0, "execution dependencies");
  assert(runtime.safetyGate.safetyChecks.length >= 3, "safety checks");
  assert(runtime.safetyGate.policyChecks.length >= 2, "policy checks");
  assert(runtime.safetyGate.riskChecks.length >= 2, "risk checks");
  assert(runtime.safetyGate.rollbackChecks.length >= 2, "rollback checks");
  assert(runtime.engine.outcomes.length > 0, "engine outcomes");
  assert(runtime.rollback.plan.steps.length > 0, "rollback plan");
  assert(runtime.audit.records.length > 0, "audit records");
  assert(runtime.audit.trace.events.length > 0, "audit trace");
  assert(runtime.metrics.executions > 0, "execution metrics");
  assert(runtime.report.summary.text.length > 0, "execution report");
  assert(runtime.flags.execution, "execution flag");
  assert(runtime.flags.safety, "safety flag");
  assert(runtime.flags.rollback, "rollback flag");
  assert(runtime.flags.audit, "audit flag");
  assert(runtime.flags.metrics, "metrics flag");
  assert(runtime.flags.reporting, "reporting flag");

  const approvedIds = governance.governanceAutonomous.proposals
    .slice(0, 2)
    .map((p: { proposalId: string }) => p.proposalId);
  const candidates = buildExecutionCandidates({
    deploymentId: "unit-exec",
    approvedProposalIds: approvedIds,
    proposals: governance.governanceAutonomous.proposals.map((p: { proposalId: string; action: string; confidence: number }) => ({
      proposalId: p.proposalId,
      action: p.action,
      confidence: p.confidence,
    })),
  });
  assert(candidates.length > 0, "unit candidates");
  const plan = buildExecutionPlan({
    deploymentId: "unit-exec",
    mode: "simulation",
    candidates,
  });
  assert(plan.sequence.length === plan.steps.length, "unit plan sequence");
  const safetyGate = runExecutionSafetyGate({
    deploymentId: "unit-exec",
    mode: "simulation",
    plan,
    autonomous: governance.governanceAutonomous,
  });
  assert(safetyGate.allowed, "unit safety allowed in simulation");
  const stepOutcome = executeStep({
    step: plan.steps[0]!,
    mode: "simulation",
    allowed: true,
  });
  assert(stepOutcome.status === "completed", "unit executeStep");
  const actionOutcome = executeAction({
    step: plan.steps[0]!,
    mode: "simulation",
    allowed: true,
  });
  assert(actionOutcome.stepId.length > 0, "unit executeAction");
  const engine = executePlan({ plan, mode: "simulation", safetyGate });
  assert(engine.simulated, "unit executePlan simulation");
  const rollbackPlan = buildRollbackPlan({
    deploymentId: "unit-exec",
    plan,
    engine,
    rollbackStrategy: governance.governanceAutonomous.executionPlan.rollbackPlan,
  });
  assert(rollbackPlan.steps.length > 0, "unit rollback plan");
  const rollbackResult = executeRollback({ rollbackPlan, engine });
  assert(rollbackResult === null || rollbackResult.planId.length > 0, "unit rollback result");
  const audit = buildExecutionAuditBundle({
    deploymentId: "unit-exec",
    mode: "simulation",
    plan,
    safetyGate,
    engine,
  });
  assert(audit.evidence.artifacts.length > 0, "unit audit");
  const metrics = computeExecutionMetrics({
    deploymentId: "unit-exec",
    engine,
    safetyGate,
    rollbackExecuted: rollbackResult !== null,
  });
  assert(metrics.executions > 0, "unit metrics");
  const report = buildExecutionReport({
    deploymentId: "unit-exec",
    engine,
    safetyGate,
    metrics,
  });
  assert(report.health.score >= 0, "unit report");

  const liveBlocked = buildOperationalAutonomousExecutionRuntime({
    deploymentId: "v4-verify-live-blocked",
    mode: "live-run",
    autonomous: governance.governanceAutonomous,
  });
  assert(liveBlocked.safetyGate.blockReasons.length > 0 || !liveBlocked.safetyGate.allowed, "live-run gate");

  console.log("✓ operational autonomous execution runtime");
  console.log(" ", runtime.summary.text);
  console.log("");
  console.log("Operational Autonomous Execution Runtime");
  console.log("PASS");
  console.log("");
  console.log(`execution=${runtime.flags.execution}`);
  console.log(`safety=${runtime.flags.safety}`);
  console.log(`rollback=${runtime.flags.rollback}`);
  console.log(`audit=${runtime.flags.audit}`);
  console.log(`metrics=${runtime.flags.metrics}`);
  console.log(`reporting=${runtime.flags.reporting}`);
}

main();
