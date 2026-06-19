/**
 * V49 SaaS Product — Phase 6 verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  SAAS_PRODUCT_P6_TAG,
  PORTAL_RUNTIME_ERROR_CODES,
  SaasPortalRuntimeError,
  clearWorkflowEvents,
  clearWorkflowP5Events,
  clearWorkflowRepository,
  clearWorkspaceProductRepository,
  createApprovalWorkflow,
  createProductWorkspace,
  createQuoteWorkflow,
  getPortalCapabilities,
  buildPortalView,
  listPortalProducts,
  resolvePortalContext,
  resolvePortalRoute,
  resolveProductContext,
  transitionBusinessWorkflow,
  transitionWorkflow,
  validateSaasProductP6Runtime,
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

  const runtimeValidation = validateSaasProductP6Runtime();
  assert(runtimeValidation.valid, `P6 runtime validation: ${runtimeValidation.summary}`);
  console.log("✓ P6 runtime validation ok");

  const tenantContext = buildOwnerContext();
  const productContext = resolveProductContext(tenantContext, "tender-ready-package");
  const workspaceProduct = createProductWorkspace({ context: productContext, status: "active" });
  const actor = tenantContext.userId;

  const emptyCapabilities = getPortalCapabilities(workspaceProduct);
  assert(emptyCapabilities.canCreateQuote, "can create quote on fresh workspace product");
  assert(!emptyCapabilities.canApprove, "cannot approve before quote approved");
  console.log("✓ portal capabilities baseline ok");

  const quote = createQuoteWorkflow(workspaceProduct.workspaceProductId, actor);
  transitionWorkflow({ workflowId: quote.workflowId, toState: "estimating", actor });
  transitionWorkflow({ workflowId: quote.workflowId, toState: "review", actor });
  transitionWorkflow({ workflowId: quote.workflowId, toState: "approved", actor });

  const midCapabilities = getPortalCapabilities(workspaceProduct);
  assert(!midCapabilities.canCreateQuote, "quote already active");
  assert(midCapabilities.canApprove, "can approve after quote approved");
  console.log("✓ portal capabilities progression ok");

  const approval = createApprovalWorkflow(workspaceProduct.workspaceProductId, actor);
  transitionBusinessWorkflow({ workflowId: approval.workflowId, toState: "reviewing", actor });
  transitionBusinessWorkflow({ workflowId: approval.workflowId, toState: "approved", actor });

  const portalContext = resolvePortalContext({
    tenantContext,
    productCode: "tender-ready-package",
    workspaceProductId: workspaceProduct.workspaceProductId,
  });
  assert(portalContext.source.resolver === "resolvePortalContext", "portal context resolver");
  assert(portalContext.workflows.length >= 2, "portal aggregates workflows");
  console.log("✓ resolvePortalContext ok");

  const view = buildPortalView(portalContext);
  assert(view.productView.productCode === "tender-ready-package", "portal product view");
  assert(view.workspaceView.workspaceId === tenantContext.workspaceId, "portal workspace view");
  assert(view.workflowView.byType.QUOTE?.currentState === "approved", "portal workflow view quote");
  assert(view.workflowView.byType.APPROVAL?.currentState === "approved", "portal workflow view approval");
  assert(view.routingMap.routes.some((route) => route.routeType === "product"), "routing map product");
  assert(view.metadata.tag === SAAS_PRODUCT_P6_TAG, "portal metadata tag");
  console.log("✓ buildPortalView ok");

  const products = listPortalProducts(tenantContext.workspaceId!, portalContext);
  assert(products.length === 1, "listPortalProducts");
  console.log("✓ listPortalProducts ok");

  const workspaceRoute = resolvePortalRoute(`/workspace/${tenantContext.workspaceId}`, portalContext);
  const productRoute = resolvePortalRoute(`/product/${workspaceProduct.workspaceProductId}`, portalContext);
  const workflowRoute = resolvePortalRoute(`/workflow/${quote.workflowId}`, portalContext);
  assert(workspaceRoute.matched && workspaceRoute.routeType === "workspace", "workspace route");
  assert(productRoute.matched && productRoute.workspaceProductId === workspaceProduct.workspaceProductId, "product route");
  assert(workflowRoute.matched && workflowRoute.workflowId === quote.workflowId, "workflow route");
  console.log("✓ resolvePortalRoute ok");

  let workspaceMismatch = false;
  try {
    resolvePortalRoute("/workspace/other-workspace", portalContext);
  } catch (error) {
    workspaceMismatch =
      error instanceof SaasPortalRuntimeError &&
      error.code === PORTAL_RUNTIME_ERROR_CODES.PORTAL_ROUTE_INVALID;
  }
  assert(workspaceMismatch, "invalid workspace route rejected");
  console.log("✓ portal route guard ok");

  const resolverSource = readFileSync(
    join(process.cwd(), "lib", "saas-product", "portal", "portal-resolver.ts"),
    "utf8",
  );
  const adapterSource = readFileSync(
    join(process.cwd(), "lib", "saas-product", "portal", "portal-adapter.ts"),
    "utf8",
  );
  assert(!resolverSource.includes("transitionWorkflow"), "portal resolver does not execute workflow");
  assert(!adapterSource.includes("executeCommercialQuote"), "no commercial execution");
  assert(!adapterSource.includes("quote-service"), "no V47 runtime execution");
  console.log("✓ P6 boundary ok");

  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  console.log(`tag=${SAAS_PRODUCT_P6_TAG}`);
  console.log("SAAS PRODUCT P6 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
