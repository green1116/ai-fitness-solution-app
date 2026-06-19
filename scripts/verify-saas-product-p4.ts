/**
 * V49 SaaS Product — Phase 4 verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  SAAS_PRODUCT_P4_TAG,
  WORKFLOW_RUNTIME_ERROR_CODES,
  SaasWorkflowRuntimeError,
  clearWorkflowEvents,
  clearWorkflowRepository,
  clearWorkspaceProductRepository,
  createProductWorkspace,
  createQuoteWorkflow,
  getAllowedTransitions,
  getWorkflowEventCount,
  listWorkflowEvents,
  listWorkflowInstances,
  mapWorkflowToCommercialAdapterContext,
  resolveProductContext,
  resolveWorkflow,
  transitionWorkflow,
  validateSaasProductP4Runtime,
  validateTransition,
  validateWorkflowInstance,
} from "../lib/saas-product";
import { buildOwnerContext } from "../lib/saas-rbac";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();

  const runtimeValidation = validateSaasProductP4Runtime();
  assert(runtimeValidation.valid, `P4 runtime validation: ${runtimeValidation.summary}`);
  console.log("✓ P4 runtime validation ok");

  const ownerCtx = buildOwnerContext();
  const context = resolveProductContext(ownerCtx, "tender-ready-package");
  const workspaceProduct = createProductWorkspace({ context, status: "active" });
  const workflow = createQuoteWorkflow(workspaceProduct.workspaceProductId, ownerCtx.userId);

  assert(workflow.workflowType === "QUOTE", "quote workflow type");
  assert(workflow.currentState === "draft", "initial draft state");
  assert(validateWorkflowInstance(workflow), "workflow instance valid");
  console.log("✓ createQuoteWorkflow ok");

  const resolved = resolveWorkflow(workflow.workflowId);
  assert(resolved.workflowId === workflow.workflowId, "resolveWorkflow");
  console.log("✓ resolveWorkflow ok");

  const listed = listWorkflowInstances(workspaceProduct.workspaceProductId);
  assert(listed.length === 1, "listWorkflowInstances");
  console.log("✓ listWorkflowInstances ok");

  assert(validateTransition("QUOTE", "draft", "estimating"), "validateTransition allowed");
  assert(!validateTransition("QUOTE", "draft", "approved"), "validateTransition denied");
  assert(getAllowedTransitions("QUOTE", "review").includes("approved"), "allowed transitions");
  console.log("✓ workflow state machine ok");

  const estimating = transitionWorkflow({
    workflowId: workflow.workflowId,
    toState: "estimating",
    actor: ownerCtx.userId,
    reason: "estimate started",
  });
  assert(estimating.currentState === "estimating", "transition to estimating");
  assert(estimating.history.length === 1, "workflow history appended");
  console.log("✓ transitionWorkflow ok");

  let illegalDenied = false;
  try {
    transitionWorkflow({
      workflowId: workflow.workflowId,
      toState: "released",
      actor: ownerCtx.userId,
    });
  } catch (error) {
    illegalDenied =
      error instanceof SaasWorkflowRuntimeError &&
      error.code === WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_TRANSITION_DENIED;
  }
  assert(illegalDenied, "illegal transition denied");
  console.log("✓ illegal transition guard ok");

  const adapterContext = mapWorkflowToCommercialAdapterContext(estimating);
  assert(adapterContext.productCode === "tender-ready-package", "adapter context product");
  assert(adapterContext.v47Module === "access-layer/quote", "adapter context v47 module");
  assert(adapterContext.tenantId === ownerCtx.tenantId, "adapter context tenant");
  console.log("✓ workflow mapper ok");

  const events = listWorkflowEvents(workflow.workflowId);
  assert(events.some((event) => event.eventType === "WORKFLOW_CREATED"), "WORKFLOW_CREATED event");
  assert(events.some((event) => event.eventType === "STATE_CHANGED"), "STATE_CHANGED event");
  assert(getWorkflowEventCount() >= 2, "workflow events recorded");
  console.log("✓ workflow events ok");

  const quoteRuntimeSource = readFileSync(
    join(process.cwd(), "lib", "saas-product", "workflow-runtime", "quote-workflow-runtime.ts"),
    "utf8",
  );
  assert(!quoteRuntimeSource.includes("executeCommercialQuote"), "no commercial execution");
  assert(!quoteRuntimeSource.includes("quote-service"), "no V47 runtime execution");
  assert(!quoteRuntimeSource.includes("createQuote("), "no V47 createQuote call");
  console.log("✓ P4 boundary ok");

  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();

  console.log(`tag=${SAAS_PRODUCT_P4_TAG}`);
  console.log("SAAS PRODUCT P4 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
