import type { BuildProductOpsRuntimeInput, ProductOpsRuntimeView } from "../shared/ops-runtime-types";
import { SAAS_PRODUCT_P7_TAG } from "../shared/ops-runtime-types";
import { OPS_RUNTIME_ERROR_CODES, SaasOpsRuntimeError } from "../shared/ops-runtime-errors";
import { buildProductOpsDashboard } from "./ops-dashboard";
import { readWorkspaceProductForOps } from "./ops-read-adapter";

export { calculateProductHealth } from "./product-health";
export { calculateWorkflowMetrics } from "./workflow-metrics";
export { calculateWorkspaceMetrics } from "./workspace-metrics";
export { runHealthChecks } from "./health-check-engine";
export {
  activateProduct,
  suspendProduct,
  archiveProduct,
  restoreProduct,
} from "./lifecycle-manager";
export { buildProductOpsDashboard } from "./ops-dashboard";

export function buildProductOpsRuntime(input: BuildProductOpsRuntimeInput): ProductOpsRuntimeView {
  const { tenantContext, workspaceProductId } = input;

  if (!tenantContext.tenantId?.trim() || !tenantContext.workspaceId?.trim()) {
    throw new SaasOpsRuntimeError(
      OPS_RUNTIME_ERROR_CODES.OPS_CONTEXT_INVALID,
      "tenantId and workspaceId are required for product ops runtime",
    );
  }

  const workspaceProduct = readWorkspaceProductForOps(workspaceProductId);
  if (
    workspaceProduct.tenantId !== tenantContext.tenantId ||
    workspaceProduct.workspaceId !== tenantContext.workspaceId
  ) {
    throw new SaasOpsRuntimeError(
      OPS_RUNTIME_ERROR_CODES.OPS_PRODUCT_NOT_FOUND,
      `Workspace product not in tenant/workspace scope: ${workspaceProductId}`,
    );
  }

  const dashboard = buildProductOpsDashboard(workspaceProductId, tenantContext);

  return {
    dashboard,
    workspaceProductId,
    tenantId: workspaceProduct.tenantId,
    workspaceId: workspaceProduct.workspaceId,
    tag: SAAS_PRODUCT_P7_TAG,
  };
}
