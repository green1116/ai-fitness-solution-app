import { buildDeliveryWorkspace } from "../workspace/builders";
import type {
  CustomerView,
  DeliveryView,
  DownloadView,
  ProjectView,
} from "./types";

export function buildCustomerPortalViews(input?: { deploymentId?: string }): {
  customerView: CustomerView;
  projectView: ProjectView;
  deliveryView: DeliveryView;
  downloadView: DownloadView;
} {
  const deploymentId = input?.deploymentId ?? "portal-default";
  const workspace = buildDeliveryWorkspace({ deploymentId });
  const { project, deliverables } = workspace;

  return {
    customerView: {
      viewId: `customer-view-${deploymentId}`,
      customerId: `customer-${deploymentId}`,
      customerName: project.customerName,
      activeProjects: 1,
      completedProjects: 0,
    },
    projectView: {
      viewId: `project-view-${deploymentId}`,
      projectId: project.projectId,
      projectName: project.projectName,
      status: project.status,
      deliverableCount: deliverables.length,
    },
    deliveryView: {
      viewId: `delivery-view-${deploymentId}`,
      projectId: project.projectId,
      deliveryStatus: workspace.deliveryStatus,
      latestVersion: "v1.0.0",
      approvalStatus: "review",
    },
    downloadView: {
      viewId: `download-view-${deploymentId}`,
      projectId: project.projectId,
      availableDownloads: deliverables.map((d) => d.label),
      latestDownloadAt: undefined,
    },
  };
}
