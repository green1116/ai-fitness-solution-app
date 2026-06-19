import { SAAS_PRODUCT_P6_TAG } from "../shared/portal-runtime-types";
import { buildOwnerContext } from "@/lib/saas-rbac";
import { resolveProductContext } from "../context/resolve-product-context";
import {
  clearWorkflowEvents,
  clearWorkflowRepository,
  createQuoteWorkflow,
} from "../workflow-runtime/quote-workflow-runtime";
import { clearWorkflowP5Events } from "../workflow-runtime/workflow-events-p5";
import {
  clearWorkspaceProductRepository,
  createProductWorkspace,
} from "../workspace-runtime/workspace-product-runtime";
import {
  buildPortalView,
  getPortalCapabilities,
  listPortalProducts,
  resolvePortalContext,
  resolvePortalRoute,
} from "../portal/portal-runtime";

export function validateSaasProductP6Runtime(): { valid: boolean; summary: string } {
  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  const tenantContext = buildOwnerContext();
  const productContext = resolveProductContext(tenantContext, "kickstart-package");
  const workspaceProduct = createProductWorkspace({ context: productContext, status: "active" });
  const quote = createQuoteWorkflow(workspaceProduct.workspaceProductId, tenantContext.userId);

  const portalContext = resolvePortalContext({
    tenantContext,
    workspaceProductId: workspaceProduct.workspaceProductId,
  });
  const view = buildPortalView(portalContext);
  const capabilities = getPortalCapabilities(workspaceProduct);
  const products = listPortalProducts(tenantContext.workspaceId!, portalContext);
  const workspaceRoute = resolvePortalRoute(`/workspace/${tenantContext.workspaceId}`, portalContext);
  const productRoute = resolvePortalRoute(`/product/${workspaceProduct.workspaceProductId}`, portalContext);
  const workflowRoute = resolvePortalRoute(`/workflow/${quote.workflowId}`, portalContext);

  const valid =
    portalContext.source.portalRuntimeVersion === SAAS_PRODUCT_P6_TAG &&
    portalContext.workflows.length === 1 &&
    portalContext.workspaceProducts.length === 1 &&
    view.metadata.tag === SAAS_PRODUCT_P6_TAG &&
    view.productView.workspaceProductId === workspaceProduct.workspaceProductId &&
    view.workflowView.instances.length === 1 &&
    view.routingMap.routes.length >= 3 &&
    capabilities.canCreateQuote === false &&
    capabilities.canApprove === false &&
    products.length === 1 &&
    workspaceRoute.matched &&
    productRoute.matched &&
    workflowRoute.matched &&
    workflowRoute.workflowId === quote.workflowId;

  clearWorkspaceProductRepository();
  clearWorkflowRepository();
  clearWorkflowEvents();
  clearWorkflowP5Events();

  return {
    valid,
    summary: `p6Tag=${SAAS_PRODUCT_P6_TAG} portalShellValid=${valid}`,
  };
}
