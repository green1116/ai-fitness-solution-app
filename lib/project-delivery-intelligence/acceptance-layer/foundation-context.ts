import { PDI_CANONICAL_ID, PDI_FREEZE_TAG } from "../shared/constants";
import { validateProjectFoundation } from "../project-foundation/foundation-validation";
import { buildMilestoneRegistry } from "../project-foundation/milestone-registry";
import { buildProjectRegistry } from "../project-foundation/project-registry";
import { buildExecutionContext } from "../execution-layer/execution-context";
import { validateExecutionLayer } from "../execution-layer/execution-validation";
import { buildDeliveryIssueRegistry } from "../risk-issue-layer/delivery-issue-registry";
import { buildDeliveryRiskRegistry } from "../risk-issue-layer/delivery-risk-registry";
import { validateRiskIssueLayer } from "../risk-issue-layer/risk-issue-validation";
import { buildAcceptanceCriteriaRegistry } from "./acceptance-criteria-registry";
import { buildAcceptanceChecks } from "./acceptance-check-builder";
import { assessDeliveryReadiness } from "./delivery-readiness";
import type { ProjectDeliveryFoundationContext } from "./acceptance-types";

function resolveFoundationValid(): boolean {
  return (
    validateProjectFoundation().valid &&
    validateExecutionLayer().valid &&
    validateRiskIssueLayer().valid
  );
}

let cachedContext: ProjectDeliveryFoundationContext | undefined;

export function buildProjectDeliveryFoundationContext(): ProjectDeliveryFoundationContext {
  if (cachedContext) return cachedContext;

  const projects = buildProjectRegistry();
  const milestones = buildMilestoneRegistry();
  const execution = buildExecutionContext();
  const risks = buildDeliveryRiskRegistry();
  const issues = buildDeliveryIssueRegistry();
  const acceptanceCriteria = buildAcceptanceCriteriaRegistry();
  const acceptanceChecks = buildAcceptanceChecks();
  const readiness = assessDeliveryReadiness();
  const foundationValid = resolveFoundationValid();

  cachedContext = {
    contextId: "pdi-foundation-context-v45-p4",
    projects,
    milestones,
    execution,
    risks,
    issues,
    acceptanceCriteria,
    acceptanceChecks,
    readiness,
    stats: {
      projectCount: projects.count,
      milestoneCount: milestones.count,
      taskCount: execution.tasks.length,
      riskCount: risks.count,
      issueCount: issues.count,
      criteriaCount: acceptanceCriteria.count,
      checkCount: acceptanceChecks.count,
      passCount: acceptanceChecks.passCount,
      readinessScore: readiness.readinessScore,
    },
    foundationValid,
    freezeTag: PDI_FREEZE_TAG,
    mode: PDI_CANONICAL_ID,
  };

  return cachedContext;
}
