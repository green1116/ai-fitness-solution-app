import type { ExecutionPlan, ExecutionRunMode, ExecutionSafetyGateResult } from "./types";
import type { GovernanceAutonomousRuntimeResult } from "../governance/autonomous/autonomous-types";

export function runExecutionSafetyGate(input: {
  deploymentId: string;
  mode: ExecutionRunMode;
  plan: ExecutionPlan;
  autonomous: GovernanceAutonomousRuntimeResult;
}): ExecutionSafetyGateResult {
  const approvalBlocked = input.autonomous.approval.status === "blocked";
  const manualReview = input.autonomous.approval.status === "manual_review";
  const readiness = input.autonomous.analysis.readinessScore;

  const safetyChecks = [
    {
      checkId: `safety-readiness-${input.deploymentId}`,
      name: "readiness-threshold",
      passed: readiness >= 40 || input.mode === "simulation",
      detail: `readiness=${readiness}`,
    },
    {
      checkId: `safety-steps-${input.deploymentId}`,
      name: "plan-has-steps",
      passed: input.plan.steps.length > 0,
      detail: `steps=${input.plan.steps.length}`,
    },
    {
      checkId: `safety-mode-${input.deploymentId}`,
      name: "mode-allowed",
      passed: input.mode !== "live-run" || !approvalBlocked,
      detail: `mode=${input.mode} approval=${input.autonomous.approval.status}`,
    },
  ];

  const policyChecks = [
    {
      checkId: `policy-governance-${input.deploymentId}`,
      policyId: "governance-autonomous-policy",
      passed: input.autonomous.analysis.blockers.length <= 3 || input.mode === "simulation",
      detail: `blockers=${input.autonomous.analysis.blockers.length}`,
    },
    {
      checkId: `policy-execution-plan-${input.deploymentId}`,
      policyId: "execution-plan-safest-path",
      passed: input.autonomous.executionPlan.safestPath || input.mode !== "live-run",
      detail: `safestPath=${input.autonomous.executionPlan.safestPath}`,
    },
  ];

  const riskChecks = [
    {
      checkId: `risk-confidence-${input.deploymentId}`,
      riskLevel: (input.autonomous.autonomousScore.confidence >= 60
        ? "low"
        : "high") as "low" | "medium" | "high" | "critical",
      passed: input.autonomous.autonomousScore.confidence >= 50 || input.mode === "simulation",
      detail: `confidence=${input.autonomous.autonomousScore.confidence}`,
    },
    {
      checkId: `risk-live-run-${input.deploymentId}`,
      riskLevel: (manualReview ? "medium" : "low") as "low" | "medium" | "high" | "critical",
      passed: input.mode !== "live-run" || !manualReview,
      detail: `manualReview=${manualReview}`,
    },
  ];

  const rollbackChecks = [
    {
      checkId: `rollback-plan-${input.deploymentId}`,
      rollbackReady: input.autonomous.executionPlan.rollbackPlan.length > 0,
      detail: input.autonomous.executionPlan.rollbackPlan,
    },
    {
      checkId: `rollback-reversible-${input.deploymentId}`,
      rollbackReady: input.plan.steps.every((step) => step.action.reversible || input.mode === "simulation"),
      detail: `reversibleSteps=${input.plan.steps.filter((s) => s.action.reversible).length}`,
    },
  ];

  const blockReasons: ExecutionSafetyGateResult["blockReasons"] = [];
  if (approvalBlocked && input.mode === "live-run") {
    blockReasons.push({
      reasonId: `block-approval-${input.deploymentId}`,
      code: "approval",
      message: "governance approval blocked for live-run",
    });
  }
  if (!safetyChecks.every((check) => check.passed)) {
    blockReasons.push({
      reasonId: `block-safety-${input.deploymentId}`,
      code: "safety",
      message: "safety checks failed",
    });
  }
  if (!policyChecks.every((check) => check.passed) && input.mode === "live-run") {
    blockReasons.push({
      reasonId: `block-policy-${input.deploymentId}`,
      code: "policy",
      message: "policy checks failed for live-run",
    });
  }

  const checksPassed =
    safetyChecks.filter((c) => c.passed).length +
    policyChecks.filter((c) => c.passed).length +
    riskChecks.filter((c) => c.passed).length +
    rollbackChecks.filter((c) => c.rollbackReady).length;

  const allowed =
    input.mode === "simulation" ||
    (blockReasons.length === 0 &&
      safetyChecks.every((c) => c.passed) &&
      (input.mode === "dry-run" || policyChecks.every((c) => c.passed)));

  return {
    gateId: `safety-gate-${input.deploymentId}`,
    safetyChecks,
    policyChecks,
    riskChecks,
    rollbackChecks,
    approval: {
      approvalId: `execution-approval-${input.deploymentId}`,
      approved: allowed,
      mode: input.mode,
      checksPassed,
      timestamp: new Date().toISOString(),
    },
    blockReasons,
    allowed,
  };
}
