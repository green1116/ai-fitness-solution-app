import { SAAS_PRODUCT_P7_TAG } from "../shared/ops-runtime-types";
import { OPS_RUNTIME_ERROR_CODES, SaasOpsRuntimeError } from "../shared/ops-runtime-errors";
import { buildOwnerContext } from "@/lib/saas-rbac";
import { resolveProductContext } from "../context/resolve-product-context";
import {
  clearWorkflowEvents,
  clearWorkflowRepository,
  createQuoteWorkflow,
  transitionWorkflow,
} from "../workflow-runtime/quote-workflow-runtime";
import { clearWorkflowP5Events } from "../workflow-runtime/workflow-events-p5";
import {
  clearWorkspaceProductRepository,
  createProductWorkspace,
} from "../workspace-runtime/workspace-product-runtime";
import {
  activateProduct,
  archiveProduct,
  buildProductOpsDashboard,
  buildProductOpsRuntime,
  calculateProductHealth,
  restoreProduct,
  runHealthChecks,
  suspendProduct,
} from "../ops/ops-runtime";
import { readWorkflowsForOps, readWorkspaceProductsForOps } from "../ops/ops-read-adapter";

export function validateSaasProductP7Runtime(): { valid: boolean; summary: string } {
  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  const tenantContext = buildOwnerContext();
  const productContext = resolveProductContext(tenantContext, "kickstart-package");
  const draftProduct = createProductWorkspace({ context: productContext, status: "draft" });
  const activated = activateProduct(draftProduct.workspaceProductId);
  const quote = createQuoteWorkflow(activated.workspaceProductId, tenantContext.userId);
  transitionWorkflow({
    workflowId: quote.workflowId,
    toState: "estimating",
    actor: tenantContext.userId,
  });

  const dashboard = buildProductOpsDashboard(activated.workspaceProductId, tenantContext);
  const runtime = buildProductOpsRuntime({
    tenantContext,
    workspaceProductId: activated.workspaceProductId,
  });
  const suspended = suspendProduct(activated.workspaceProductId);
  const restored = restoreProduct(suspended.workspaceProductId);

  let lifecycleDenied = false;
  try {
    activateProduct(restored.workspaceProductId);
  } catch (error) {
    lifecycleDenied =
      error instanceof SaasOpsRuntimeError &&
      error.code === OPS_RUNTIME_ERROR_CODES.OPS_LIFECYCLE_TRANSITION_DENIED;
  }

  const workflows = readWorkflowsForOps(activated.workspaceProductId);
  const workspaceProducts = readWorkspaceProductsForOps(tenantContext.tenantId, tenantContext.workspaceId!);
  const findings = runHealthChecks(restored, workflows, workspaceProducts.map((item) => item.workspaceProductId));
  const health = calculateProductHealth(findings);

  const valid =
    activated.status === "active" &&
    suspended.status === "suspended" &&
    restored.status === "active" &&
    lifecycleDenied &&
    dashboard.metadata.tag === SAAS_PRODUCT_P7_TAG &&
    dashboard.workflowMetrics.quoteCount === 1 &&
    dashboard.workflowMetrics.activeWorkflowCount === 1 &&
    dashboard.healthFindings.some((finding) => finding.code === "WORKFLOW_STUCK") &&
    dashboard.healthFindings.some((finding) => finding.code === "INACTIVE_PRODUCT") === false &&
    runtime.tag === SAAS_PRODUCT_P7_TAG &&
    runtime.dashboard.lifecycleSummary.currentState === "ACTIVE" &&
    (health === "WARNING" || health === "HEALTHY");

  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  return {
    valid,
    summary: `p7Tag=${SAAS_PRODUCT_P7_TAG} productOpsValid=${valid}`,
  };
}
