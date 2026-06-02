/**
 * V8.5 Customer Delivery Platform — verification
 */
import {
  CUSTOMER_DELIVERY_VERSION,
  buildCustomerProject,
  buildMilestones,
  buildDeliverables,
  buildSuccessMetrics,
  buildDeliverySummary,
  buildCustomerDeliveryResponse,
  validateCustomerDelivery,
} from "../lib/productization/delivery";

const DEPLOYMENT_ID = "v85-customer-delivery-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testProject() {
  const project = buildCustomerProject({ deploymentId: DEPLOYMENT_ID });
  assert(project.projectId.length > 0, "project id");
  assert(project.customerName.length > 0, "customer name");
  assert(project.owner.length > 0, "owner");
  assert(project.startedAt.length > 0, "startedAt");
  assert(project.targetCompletionAt.length > 0, "target completion");
  assert(
    [
      "initiated",
      "planning",
      "proposal-delivered",
      "trial-active",
      "implementation",
      "completed",
      "renewal",
    ].includes(project.status),
    "project status",
  );
  console.log("✓ project valid");
}

function testMilestones() {
  const milestones = buildMilestones();
  assert(milestones.length === 7, "milestones count");
  assert(milestones.some((m) => m.name === "Initiated"), "initiated milestone");
  assert(milestones.some((m) => m.name === "Planning"), "planning milestone");
  assert(milestones.some((m) => m.name === "Proposal Delivered"), "proposal milestone");
  assert(milestones.some((m) => m.name === "Trial Active"), "trial milestone");
  assert(milestones.some((m) => m.name === "Implementation"), "implementation milestone");
  assert(milestones.some((m) => m.name === "Completed"), "completed milestone");
  assert(milestones.some((m) => m.name === "Renewal"), "renewal milestone");
  assert(
    milestones.every((m) =>
      ["planned", "in-progress", "completed", "blocked"].includes(m.status),
    ),
    "milestone statuses",
  );
  console.log("✓ milestones valid");
}

function testDeliverables() {
  const deliverables = buildDeliverables();
  assert(deliverables.length === 5, "deliverables count");
  assert(deliverables.some((d) => d.type === "plan-package"), "plan package");
  assert(deliverables.some((d) => d.type === "budget-package"), "budget package");
  assert(deliverables.some((d) => d.type === "proposal-pdf"), "proposal pdf");
  assert(deliverables.some((d) => d.type === "tender-package"), "tender package");
  assert(deliverables.some((d) => d.type === "executive-summary"), "executive summary");
  console.log("✓ deliverables valid");
}

function testMetricsAndSummary() {
  const metrics = buildSuccessMetrics({ deploymentId: DEPLOYMENT_ID });
  assert(metrics.metricId.length > 0, "metric id");
  assert(metrics.deliveryCompletionRate >= 0, "delivery completion rate");
  assert(metrics.customerAdoption >= 0, "customer adoption");
  assert(metrics.workspaceUtilization >= 0, "workspace utilization");
  assert(metrics.proposalAcceptance >= 0, "proposal acceptance");
  assert(metrics.renewalReadiness >= 0, "renewal readiness");
  console.log("✓ metrics valid");

  const summary = buildDeliverySummary({ deploymentId: DEPLOYMENT_ID });
  assert(summary.version === CUSTOMER_DELIVERY_VERSION, "summary version");
  assert(summary.summaryId.length > 0, "summary id");
  assert(summary.summary.length > 0, "summary text");
  assert(summary.totalMilestones === 7, "summary milestones");
  assert(summary.totalDeliverables === 5, "summary deliverables");
  console.log("✓ summary valid");
  console.log(" ", summary.summary);
}

function testResponseAndValidation() {
  const response = buildCustomerDeliveryResponse({ deploymentId: DEPLOYMENT_ID });
  assert(response.project.projectId.length > 0, "response project");
  assert(response.milestones.length === 7, "response milestones");
  assert(response.deliverables.length === 5, "response deliverables");
  assert(response.successMetrics.metricId.length > 0, "response metrics");
  assert(response.summary.summaryId.length > 0, "response summary");

  const validation = validateCustomerDelivery({ deploymentId: DEPLOYMENT_ID });
  assert(validation.projectValid, "project valid");
  assert(validation.milestonesValid, "milestones valid");
  assert(validation.deliverablesValid, "deliverables valid");
  assert(validation.metricsValid, "metrics valid");
  assert(validation.summaryValid, "summary valid");

  console.log("");
  console.log("CUSTOMER DELIVERY VERIFY PASS");
}

function main() {
  testProject();
  testMilestones();
  testDeliverables();
  testMetricsAndSummary();
  testResponseAndValidation();
}

main();
