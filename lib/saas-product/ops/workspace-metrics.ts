import type { WorkspaceMetrics } from "../shared/ops-runtime-types";
import type { WorkspaceProductInstance } from "../shared/workspace-runtime-types";

export function calculateWorkspaceMetrics(products: WorkspaceProductInstance[]): WorkspaceMetrics {
  return {
    workspaceProductCount: products.length,
    activeCount: products.filter((item) => item.status === "active").length,
    suspendedCount: products.filter((item) => item.status === "suspended").length,
    archivedCount: products.filter((item) => item.status === "archived").length,
    draftCount: products.filter((item) => item.status === "draft").length,
  };
}
