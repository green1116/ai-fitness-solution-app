/**
 * V49 SaaS Product — Phase 5 verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  SAAS_PRODUCT_P5_TAG,
  WORKFLOW_P5_ERROR_CODES,
  WORKFLOW_RUNTIME_ERROR_CODES,
  SaasWorkflowP5Error,
  SaasWorkflowRuntimeError,
  clearWorkflowEvents,
  clearWorkflowP5Events,
  clearWorkflowRepository,
  clearWorkspaceProductRepository,
  createApprovalWorkflow,
  createDeliveryWorkflow,
  createProductWorkspace,
  createQuoteWorkflow,
  createReleaseWorkflow,
  getBusinessAllowedTransitions,
  getWorkflowP5EventCount,
  buildBusinessProcessAdapterContext,
  checkWorkflowDependency,
  isBusinessProcessReady,
  listWorkflowInstances,
  listWorkflowP5Events,
  recordBusinessProcessReadyEvent,
  resolveProductContext,
  transitionBusinessWorkflow,
  transitionWorkflow,
  validateBusinessTransition,
  validateBusinessWorkflowInstance,
  validateSaasProductP5Runtime,
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

  const runtimeValidation = validateSaasProductP5Runtime();
  assert(runtimeValidation.valid, `P5 runtime validation: ${runtimeValidation.summary}`);
  console.log("✓ P5 runtime validation ok");

  const ownerCtx = buildOwnerContext();
  const context = resolveProductContext(ownerCtx, "tender-ready-package");
  const workspaceProduct = createProductWorkspace({ context, status: "active" });
  const actor = ownerCtx.userId;
  const workspaceProductId = workspaceProduct.workspaceProductId;

  let dependencyDenied = false;
  try {
    createApprovalWorkflow(workspaceProductId, actor);
  } catch (error) {
    dependencyDenied =
      error instanceof SaasWorkflowP5Error &&
      error.code === WORKFLOW_P5_ERROR_CODES.WORKFLOW_DEPENDENCY_NOT_SATISFIED;
  }
  assert(dependencyDenied, "approval blocked without quote approved");
  console.log("✓ workflow dependency guard ok");

  const quote = createQuoteWorkflow(workspaceProductId, actor);
  transitionWorkflow({ workflowId: quote.workflowId, toState: "estimating", actor });
  transitionWorkflow({ workflowId: quote.workflowId, toState: "review", actor });
  transitionWorkflow({ workflowId: quote.workflowId, toState: "approved", actor });
  assert(checkWorkflowDependency(workspaceProductId, "APPROVAL"), "quote approved satisfies approval dependency");
  console.log("✓ quote to approved ok");

  const approval = createApprovalWorkflow(workspaceProductId, actor);
  assert(approval.workflowType === "APPROVAL" && approval.currentState === "pending", "approval initial state");
  transitionBusinessWorkflow({ workflowId: approval.workflowId, toState: "reviewing", actor });
  transitionBusinessWorkflow({ workflowId: approval.workflowId, toState: "approved", actor });
  assert(validateBusinessWorkflowInstance(approval), "approval instance valid shape");
  console.log("✓ approval workflow ok");

  const delivery = createDeliveryWorkflow(workspaceProductId, actor);
  transitionBusinessWorkflow({ workflowId: delivery.workflowId, toState: "in_progress", actor });
  transitionBusinessWorkflow({ workflowId: delivery.workflowId, toState: "completed", actor });
  console.log("✓ delivery workflow ok");

  const release = createReleaseWorkflow(workspaceProductId, actor);
  transitionBusinessWorkflow({ workflowId: release.workflowId, toState: "ready", actor });
  const released = transitionBusinessWorkflow({
    workflowId: release.workflowId,
    toState: "released",
    actor,
  });
  console.log("✓ release workflow ok");

  assert(validateBusinessTransition("APPROVAL", "pending", "reviewing"), "approval transition allowed");
  assert(!validateBusinessTransition("APPROVAL", "pending", "approved"), "approval skip denied");
  assert(getBusinessAllowedTransitions("RELEASE", "ready").includes("released"), "release allowed transitions");
  console.log("✓ multi workflow state machine ok");

  let illegalDenied = false;
  try {
    transitionBusinessWorkflow({
      workflowId: delivery.workflowId,
      toState: "planned",
      actor,
    });
  } catch (error) {
    illegalDenied =
      error instanceof SaasWorkflowRuntimeError &&
      error.code === WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_TRANSITION_DENIED;
  }
  assert(illegalDenied, "illegal business transition denied");
  console.log("✓ illegal transition guard ok");

  const adapterContext = buildBusinessProcessAdapterContext(workspaceProductId);
  assert(adapterContext.quote?.currentState === "approved", "adapter quote state");
  assert(adapterContext.approval?.currentState === "approved", "adapter approval state");
  assert(adapterContext.delivery?.currentState === "completed", "adapter delivery state");
  assert(adapterContext.release?.currentState === "released", "adapter release state");
  recordBusinessProcessReadyEvent(workspaceProductId, "RELEASE", released.workflowId);
  assert(isBusinessProcessReady(adapterContext), "business process ready");
  console.log("✓ workflow adapter context ok");

  const listed = listWorkflowInstances(workspaceProductId);
  assert(listed.length === 4, "four workflow instances in repository");
  const p5Events = listWorkflowP5Events(workspaceProductId);
  assert(p5Events.some((event) => event.eventType === "WORKFLOW_DEPENDENCY_SATISFIED"), "dependency satisfied event");
  assert(p5Events.some((event) => event.eventType === "BUSINESS_PROCESS_READY"), "business process ready event");
  assert(getWorkflowP5EventCount() >= 4, "p5 events recorded");
  console.log("✓ workflow p5 events ok");

  const approvalRuntimeSource = readFileSync(
    join(process.cwd(), "lib", "saas-product", "workflow-runtime", "approval-workflow-runtime.ts"),
    "utf8",
  );
  assert(!approvalRuntimeSource.includes("executeCommercialQuote"), "no commercial execution");
  assert(!approvalRuntimeSource.includes("quote-service"), "no V47 runtime execution");
  console.log("✓ P5 boundary ok");

  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  console.log(`tag=${SAAS_PRODUCT_P5_TAG}`);
  console.log("SAAS PRODUCT P5 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
