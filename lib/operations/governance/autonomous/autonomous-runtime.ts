import {
  GOVERNANCE_AUTONOMOUS_RUNTIME_VERSION,
  type GovernanceAutonomousRuntimeInput,
  type GovernanceAutonomousRuntimeResult,
  type GovernanceAutonomousStatus,
} from "./autonomous-types";
import { buildAutonomousSignalBundle } from "./autonomous-signals";
import { analyzeAutonomousReadiness } from "./autonomous-analysis";
import { buildGovernanceDecisionCandidates } from "./autonomous-decision";
import { buildGovernanceActionProposals } from "./autonomous-proposal";
import { buildGovernanceExecutionPlan } from "./autonomous-planning";
import { buildGovernanceRemediationPlans } from "./autonomous-remediation";
import { buildAutonomousRecoveryProposals } from "./autonomous-recovery";
import { buildGovernanceOptimizationProposals } from "./autonomous-optimization";
import { evaluateGovernanceApproval } from "./autonomous-approval";
import { computeGovernanceAutonomousScore } from "./autonomous-score";
import { buildGovernanceAutonomousLineageGraph } from "./autonomous-lineage";
import { buildGovernanceAutonomousAuditRecords } from "./autonomous-audit";
import { runGovernanceAutonomousHooks } from "./autonomous-hooks";

export function buildGovernanceAutonomousRuntime(
  input: GovernanceAutonomousRuntimeInput,
): GovernanceAutonomousRuntimeResult {
  const signals = buildAutonomousSignalBundle({
    deploymentId: input.deploymentId,
    intelligence: input.intelligence,
  });
  const analysis = analyzeAutonomousReadiness({
    deploymentId: input.deploymentId,
    signals,
    intelligence: input.intelligence,
  });
  const decisions = buildGovernanceDecisionCandidates({
    deploymentId: input.deploymentId,
    intelligence: input.intelligence,
    observability: input.observability,
    lifecycleContinuity: input.lifecycleContinuity,
  });
  let proposals = buildGovernanceActionProposals({
    deploymentId: input.deploymentId,
    decisions,
    intelligence: input.intelligence,
  });
  const recoveryProposals = buildAutonomousRecoveryProposals({
    deploymentId: input.deploymentId,
    intelligence: input.intelligence,
    proposals,
  });
  for (const rp of recoveryProposals) {
    if (!proposals.some((p) => p.action === rp.action)) proposals.push(rp);
  }
  const executionPlan = buildGovernanceExecutionPlan({
    deploymentId: input.deploymentId,
    proposals,
  });
  const remediations = buildGovernanceRemediationPlans({
    deploymentId: input.deploymentId,
    intelligence: input.intelligence,
    observability: input.observability,
  });
  const optimizations = buildGovernanceOptimizationProposals({
    deploymentId: input.deploymentId,
    intelligence: input.intelligence,
    observability: input.observability,
  });
  const approval = evaluateGovernanceApproval({
    deploymentId: input.deploymentId,
    analysis,
    proposals,
    executionPlan,
    intelligence: input.intelligence,
  });
  const autonomousScore = computeGovernanceAutonomousScore({
    deploymentId: input.deploymentId,
    decisions,
    executionPlan,
    remediations,
    optimizations,
    approval,
  });

  const lineage = buildGovernanceAutonomousLineageGraph({
    deploymentId: input.deploymentId,
    signals,
    analysis,
    decisions,
    proposals,
    executionPlan,
    remediations,
    optimizations,
    approval,
    autonomousScore,
  });

  const autonomousId = `governance-autonomous-${input.deploymentId}`;
  const federationId = input.observability.health.federationId;
  const audit = buildGovernanceAutonomousAuditRecords({
    autonomousId,
    federationId,
    proposalCount: proposals.length,
    approval,
    autonomousScore,
  });
  const hooks = runGovernanceAutonomousHooks({
    proposalCount: proposals.length,
    stepCount: executionPlan.steps.length,
    approvalStatus: approval.status,
  });

  let status: GovernanceAutonomousStatus = "advisory";
  if (approval.status === "auto_approved" && analysis.mode === "autonomous") status = "autopilot_ready";
  else if (approval.status === "blocked") status = "advisory";
  else if (executionPlan.steps.length > 0) status = "planned";
  else if (proposals.length > 0) status = "proposed";
  else if (approval.status === "manual_review" || approval.status === "executive_review") {
    status = "awaiting_approval";
  }

  const traceId = `governance-autonomous-trace-${input.deploymentId}`;
  return {
    version: GOVERNANCE_AUTONOMOUS_RUNTIME_VERSION,
    registry: { autonomousId, proposalCount: proposals.length },
    signals,
    analysis,
    decisions,
    proposals,
    executionPlan,
    remediations,
    optimizations,
    approval,
    autonomousScore,
    lineage,
    audit,
    hooks,
    summary: {
      summaryId: `governance-autonomous-summary-${Date.now()}`,
      text: `autonomous=${autonomousId} mode=${analysis.mode} proposals=${proposals.length} approval=${approval.status} safest=${executionPlan.safestPath} composite=${autonomousScore.compositeScore} status=${status}`,
      traceId,
    },
    status,
  };
}

export { GOVERNANCE_AUTONOMOUS_RUNTIME_VERSION };
