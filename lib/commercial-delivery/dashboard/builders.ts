import { runApprovalRuntime } from "../approval/runtime";
import { runCustomerPortalRuntime } from "../customer-portal/runtime";
import { runDeliveryLedgerRuntime } from "../ledger/runtime";
import { runDownloadRuntime } from "../download/runtime";
import { runDeliveryWorkspaceRuntime } from "../workspace/runtime";

export function buildCommercialDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  activeProjects: number;
  completedProjects: number;
  deliveries: number;
  downloads: number;
  approvals: number;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";

  const workspace = runDeliveryWorkspaceRuntime({ deploymentId });
  const portal = runCustomerPortalRuntime({ deploymentId });
  const ledger = runDeliveryLedgerRuntime({ deploymentId });
  const download = runDownloadRuntime({ deploymentId });
  const approval = runApprovalRuntime({ deploymentId });

  const activeProjects = portal.payload.customerView.activeProjects;
  const completedProjects = portal.payload.customerView.completedProjects;
  const deliveries = ledger.payload.ledger.entries.filter((e) => e.eventType === "delivered").length;
  const downloads = download.payload.downloads.length;
  const approvals = approval.payload.records.filter(
    (r) => r.status === "approved" || r.status === "delivered",
  ).length;

  const allOk =
    workspace.status === "success" &&
    portal.status === "success" &&
    ledger.status === "success" &&
    download.status === "success" &&
    approval.status === "success";

  return {
    activeProjects: allOk ? activeProjects : 0,
    completedProjects,
    deliveries: allOk ? deliveries : 0,
    downloads: allOk ? downloads : 0,
    approvals: allOk ? approvals : 0,
    summary: `commercial-dashboard active=${activeProjects} completed=${completedProjects} deliveries=${deliveries} downloads=${downloads} approvals=${approvals}`,
  };
}
