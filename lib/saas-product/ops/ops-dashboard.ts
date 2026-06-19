import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import type { ProductOpsDashboard } from "../shared/ops-runtime-types";
import { SAAS_PRODUCT_P7_TAG, mapStatusToOpsLifecycle } from "../shared/ops-runtime-types";
import { buildPortalView, getPortalCapabilities, resolvePortalContext } from "../portal/portal-runtime";
import { calculateProductHealth } from "./product-health";
import { runHealthChecks } from "./health-check-engine";
import {
  readWorkflowsForOps,
  readWorkspaceProductForOps,
  readWorkspaceProductsForOps,
} from "./ops-read-adapter";
import { calculateWorkflowMetrics } from "./workflow-metrics";
import { calculateWorkspaceMetrics } from "./workspace-metrics";

export function buildProductOpsDashboard(
  workspaceProductId: string,
  tenantContext: TenantContext,
): ProductOpsDashboard {
  const workspaceProduct = readWorkspaceProductForOps(workspaceProductId);
  const workflows = readWorkflowsForOps(workspaceProductId);
  const workspaceProducts = readWorkspaceProductsForOps(workspaceProduct.tenantId, workspaceProduct.workspaceId);
  const workspaceProductIds = workspaceProducts.map((item) => item.workspaceProductId);

  const healthFindings = runHealthChecks(workspaceProduct, workflows, workspaceProductIds);
  const health = calculateProductHealth(healthFindings);
  const workflowMetrics = calculateWorkflowMetrics(workflows);
  const workspaceMetrics = calculateWorkspaceMetrics(workspaceProducts);

  const portalContext = resolvePortalContext({
    tenantContext,
    workspaceProductId,
  });
  const portalView = buildPortalView(portalContext);
  const capabilities = getPortalCapabilities(workspaceProduct);

  return {
    health,
    healthFindings,
    workflowMetrics,
    workspaceMetrics,
    lifecycleSummary: {
      currentState: mapStatusToOpsLifecycle(workspaceProduct.status),
      workspaceProductId,
      status: workspaceProduct.status,
      lastUpdatedAt: workspaceProduct.updatedAt,
    },
    portalSummary: {
      productCode: workspaceProduct.productCode,
      workspaceProductId,
      routeCount: portalView.routingMap.routes.length,
      canCreateQuote: capabilities.canCreateQuote,
      canApprove: capabilities.canApprove,
      canDeliver: capabilities.canDeliver,
      canRelease: capabilities.canRelease,
    },
    metadata: {
      tag: SAAS_PRODUCT_P7_TAG,
      workspaceProductId,
      tenantId: workspaceProduct.tenantId,
      workspaceId: workspaceProduct.workspaceId,
      composedAt: new Date().toISOString(),
    },
  };
}
