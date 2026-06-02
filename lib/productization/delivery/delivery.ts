import { buildDeliverables } from "./deliverables";
import { buildMilestones } from "./milestones";
import { buildCustomerProject } from "./project";
import { buildSuccessMetrics } from "./success";
import type { CustomerDeliveryResponse, DeliverySummary } from "./types";
import { CUSTOMER_DELIVERY_VERSION } from "./types";

function computeOverallHealth(input: {
  completionRate: number;
  adoption: number;
  proposalAcceptance: number;
}): DeliverySummary["overallHealth"] {
  const avg = (input.completionRate + input.adoption + input.proposalAcceptance) / 3;
  if (avg >= 80) return "excellent";
  if (avg >= 65) return "good";
  return "watch";
}

export function buildDeliverySummary(input?: { deploymentId?: string }): DeliverySummary {
  const deploymentId = input?.deploymentId ?? "customer-delivery-default";
  const project = buildCustomerProject({ deploymentId });
  const milestones = buildMilestones({ owner: project.owner });
  const deliverables = buildDeliverables();
  const successMetrics = buildSuccessMetrics({ deploymentId });

  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const readyDeliverables = deliverables.filter((d) => d.ready).length;
  const overallHealth = computeOverallHealth({
    completionRate: successMetrics.deliveryCompletionRate,
    adoption: successMetrics.customerAdoption,
    proposalAcceptance: successMetrics.proposalAcceptance,
  });

  return {
    summaryId: `delivery-summary-${deploymentId}`,
    version: CUSTOMER_DELIVERY_VERSION,
    projectId: project.projectId,
    overallHealth,
    completedMilestones,
    totalMilestones: milestones.length,
    readyDeliverables,
    totalDeliverables: deliverables.length,
    summary: `delivery-summary project=${project.projectId} health=${overallHealth} milestones=${completedMilestones}/${milestones.length} deliverables=${readyDeliverables}/${deliverables.length}`,
  };
}

export function buildCustomerDeliveryResponse(input?: {
  deploymentId?: string;
}): CustomerDeliveryResponse {
  const deploymentId = input?.deploymentId ?? "customer-delivery-default";
  const project = buildCustomerProject({ deploymentId });
  return {
    version: CUSTOMER_DELIVERY_VERSION,
    project,
    milestones: buildMilestones({ owner: project.owner }),
    deliverables: buildDeliverables(),
    successMetrics: buildSuccessMetrics({ deploymentId }),
    summary: buildDeliverySummary({ deploymentId }),
  };
}

export function validateCustomerDelivery(input?: { deploymentId?: string }): {
  projectValid: boolean;
  milestonesValid: boolean;
  deliverablesValid: boolean;
  metricsValid: boolean;
  summaryValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "customer-delivery-default";
  const response = buildCustomerDeliveryResponse({ deploymentId });

  const projectValid =
    response.project.projectId.length > 0 &&
    response.project.customerName.length > 0 &&
    response.project.owner.length > 0;

  const milestonesValid =
    response.milestones.length === 7 &&
    response.milestones.every((m) =>
      ["planned", "in-progress", "completed", "blocked"].includes(m.status),
    );

  const deliverablesValid =
    response.deliverables.length === 5 &&
    response.deliverables.every((d) => d.name.length > 0);

  const metricsValid =
    response.successMetrics.deliveryCompletionRate >= 0 &&
    response.successMetrics.customerAdoption >= 0 &&
    response.successMetrics.workspaceUtilization >= 0 &&
    response.successMetrics.proposalAcceptance >= 0 &&
    response.successMetrics.renewalReadiness >= 0;

  const summaryValid =
    response.summary.summaryId.length > 0 &&
    response.summary.projectId === response.project.projectId &&
    response.summary.totalMilestones === response.milestones.length &&
    response.summary.totalDeliverables === response.deliverables.length;

  return {
    projectValid,
    milestonesValid,
    deliverablesValid,
    metricsValid,
    summaryValid,
  };
}
