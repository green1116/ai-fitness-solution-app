import type {
  PortalContext,
  PortalProductView,
  PortalViewModel,
  PortalWorkflowSummary,
  PortalWorkspaceView,
} from "../shared/portal-runtime-types";
import { SAAS_PRODUCT_P6_TAG } from "../shared/portal-runtime-types";
import type { WorkspaceProductInstance } from "../shared/workspace-runtime-types";
import { composePortalModel } from "./portal-composition";
import { getPortalCapabilities } from "./portal-capability";
import { buildPortalRoutingMap } from "./portal-routing-map";

function buildProductView(workspaceProduct: WorkspaceProductInstance): PortalProductView {
  const snapshot = workspaceProduct.productContextSnapshot;
  return {
    workspaceProductId: workspaceProduct.workspaceProductId,
    productCode: workspaceProduct.productCode,
    displayName: workspaceProduct.productDefinition.displayName,
    status: workspaceProduct.status,
    tenantId: workspaceProduct.tenantId,
    workspaceId: workspaceProduct.workspaceId,
    workflowStageCount: snapshot.workflowStages.length,
    permissionCount: snapshot.permissions.length,
  };
}

function buildWorkflowSummary(workflow: PortalContext["workflows"][number]): PortalWorkflowSummary {
  return {
    workflowId: workflow.workflowId,
    workspaceProductId: workflow.workspaceProductId,
    workflowType: workflow.workflowType,
    currentState: workflow.currentState,
    historyLength: workflow.history.length,
    updatedAt: workflow.updatedAt,
  };
}

function buildWorkspaceView(context: PortalContext, products: PortalProductView[]): PortalWorkspaceView {
  return {
    workspaceId: context.workspaceId,
    tenantId: context.tenantId,
    productCount: products.length,
    activeProductCount: products.filter((item) => item.status === "active").length,
    products,
  };
}

export function buildPortalView(portalContext: PortalContext): PortalViewModel {
  const model = composePortalModel(portalContext);
  const primary = model.primaryWorkspaceProduct ?? portalContext.workspaceProducts[0];

  if (!primary) {
    throw new Error("Portal view requires at least one workspace product");
  }

  const productViews = portalContext.workspaceProducts.map(buildProductView);
  const workflowSummaries = portalContext.workflows.map(buildWorkflowSummary);
  const byType: PortalViewModel["workflowView"]["byType"] = {};

  for (const summary of workflowSummaries) {
    byType[summary.workflowType] = summary;
  }

  return {
    productView: buildProductView(primary),
    workspaceView: buildWorkspaceView(portalContext, productViews),
    workflowView: {
      workspaceProductId: primary.workspaceProductId,
      instances: workflowSummaries,
      byType,
    },
    capabilities: getPortalCapabilities(primary),
    routingMap: buildPortalRoutingMap(portalContext),
    metadata: {
      tag: SAAS_PRODUCT_P6_TAG,
      tenantId: portalContext.tenantId,
      workspaceId: portalContext.workspaceId,
      workspaceProductCount: portalContext.workspaceProducts.length,
      workflowCount: portalContext.workflows.length,
      composedAt: new Date().toISOString(),
    },
  };
}

export function listPortalProducts(workspaceId: string, portalContext: PortalContext): PortalProductView[] {
  return portalContext.workspaceProducts
    .filter((item) => item.workspaceId === workspaceId)
    .map(buildProductView);
}
