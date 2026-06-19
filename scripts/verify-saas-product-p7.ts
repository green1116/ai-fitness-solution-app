/**
 * V49 SaaS Product — Phase 7 verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  SAAS_PRODUCT_P7_TAG,
  OPS_RUNTIME_ERROR_CODES,
  SaasOpsRuntimeError,
  clearWorkflowEvents,
  clearWorkflowP5Events,
  clearWorkflowRepository,
  clearWorkspaceProductRepository,
  createApprovalWorkflow,
  createProductWorkspace,
  createQuoteWorkflow,
  activateProduct,
  archiveProduct,
  buildProductOpsDashboard,
  buildProductOpsRuntime,
  calculateProductHealth,
  calculateWorkflowMetrics,
  calculateWorkspaceMetrics,
  listWorkflowInstances,
  restoreProduct,
  runHealthChecks,
  suspendProduct,
  resolveProductContext,
  transitionBusinessWorkflow,
  transitionWorkflow,
  validateSaasProductP7Runtime,
} from "../lib/saas-product";
import { buildOwnerContext } from "../lib/saas-rbac";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  const runtimeValidation = validateSaasProductP7Runtime();
  assert(runtimeValidation.valid, `P7 runtime validation: ${runtimeValidation.summary}`);
  console.log("✓ P7 runtime validation ok");

  const tenantContext = buildOwnerContext();
  const productContext = resolveProductContext(tenantContext, "tender-ready-package");
  const draftProduct = createProductWorkspace({ context: productContext, status: "draft" });
  const workspaceProduct = activateProduct(draftProduct.workspaceProductId);
  const actor = tenantContext.userId;
  const workspaceProductId = workspaceProduct.workspaceProductId;

  assert(workspaceProduct.status === "active", "activateProduct");
  console.log("✓ lifecycle activate ok");

  const quote = createQuoteWorkflow(workspaceProductId, actor);
  transitionWorkflow({ workflowId: quote.workflowId, toState: "estimating", actor });
  transitionWorkflow({ workflowId: quote.workflowId, toState: "review", actor });
  transitionWorkflow({ workflowId: quote.workflowId, toState: "approved", actor });
  const workflowsAfterQuote = listWorkflowInstances(workspaceProductId);

  const workflowMetrics = calculateWorkflowMetrics(workflowsAfterQuote);
  assert(workflowMetrics.quoteCount === 1, "workflow metrics quote count");
  assert(workflowMetrics.activeWorkflowCount === 1, "workflow metrics active count");
  console.log("✓ workflow metrics ok");

  const workspaceMetrics = calculateWorkspaceMetrics([workspaceProduct]);
  assert(workspaceMetrics.activeCount === 1, "workspace metrics active count");
  console.log("✓ workspace metrics ok");

  const findings = runHealthChecks(workspaceProduct, workflowsAfterQuote, [workspaceProductId]);
  const health = calculateProductHealth(findings);
  assert(findings.some((finding) => finding.code === "MISSING_APPROVAL"), "missing approval finding");
  assert(health === "WARNING", "product health warning");
  console.log("✓ health check engine ok");

  const approval = createApprovalWorkflow(workspaceProductId, actor);
  transitionBusinessWorkflow({ workflowId: approval.workflowId, toState: "reviewing", actor });
  transitionBusinessWorkflow({ workflowId: approval.workflowId, toState: "approved", actor });

  const dashboard = buildProductOpsDashboard(workspaceProductId, tenantContext);
  assert(dashboard.metadata.tag === SAAS_PRODUCT_P7_TAG, "ops dashboard tag");
  assert(dashboard.healthFindings.some((finding) => finding.code === "MISSING_DELIVERY"), "missing delivery");
  assert(dashboard.portalSummary.canDeliver, "portal summary capabilities");
  assert(dashboard.lifecycleSummary.currentState === "ACTIVE", "lifecycle summary");
  console.log("✓ ops dashboard ok");

  const opsRuntime = buildProductOpsRuntime({ tenantContext, workspaceProductId });
  assert(opsRuntime.tag === SAAS_PRODUCT_P7_TAG, "ops runtime tag");
  assert(opsRuntime.dashboard.workflowMetrics.approvalCount === 1, "ops runtime metrics");
  console.log("✓ ops runtime ok");

  const suspended = suspendProduct(workspaceProductId);
  assert(suspended.status === "suspended", "suspendProduct");
  const workflowsAfterApproval = listWorkflowInstances(workspaceProductId);
  const suspendedFindings = runHealthChecks(suspended, workflowsAfterApproval, [workspaceProductId]);
  assert(suspendedFindings.some((finding) => finding.code === "INACTIVE_PRODUCT"), "inactive product finding");
  const restored = restoreProduct(workspaceProductId);
  assert(restored.status === "active", "restoreProduct");
  const archived = archiveProduct(workspaceProductId);
  assert(archived.status === "archived", "archiveProduct");
  const unarchived = restoreProduct(workspaceProductId);
  assert(unarchived.status === "draft", "restore archived to draft");
  console.log("✓ lifecycle manager ok");

  let lifecycleDenied = false;
  try {
    suspendProduct(unarchived.workspaceProductId);
  } catch (error) {
    lifecycleDenied =
      error instanceof SaasOpsRuntimeError &&
      error.code === OPS_RUNTIME_ERROR_CODES.OPS_LIFECYCLE_TRANSITION_DENIED;
  }
  assert(lifecycleDenied, "lifecycle transition guard");
  console.log("✓ lifecycle guard ok");

  const opsRuntimeSource = readFileSync(
    join(process.cwd(), "lib", "saas-product", "ops", "ops-runtime.ts"),
    "utf8",
  );
  const dashboardSource = readFileSync(
    join(process.cwd(), "lib", "saas-product", "ops", "ops-dashboard.ts"),
    "utf8",
  );
  assert(!opsRuntimeSource.includes("transitionWorkflow"), "ops runtime does not execute workflow");
  assert(!opsRuntimeSource.includes("transitionBusinessWorkflow"), "ops runtime does not transition business workflow");
  assert(!dashboardSource.includes("executeCommercialQuote"), "no commercial execution");
  assert(!dashboardSource.includes("quote-service"), "no V47 runtime execution");
  console.log("✓ P7 boundary ok");

  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  console.log(`tag=${SAAS_PRODUCT_P7_TAG}`);
  console.log("SAAS PRODUCT P7 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
