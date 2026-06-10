import type { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";

export const CUSTOMER_PORTAL_RUNTIME_VERSION = "v14.0-customer-portal-1" as const;

export interface CustomerView {
  viewId: string;
  customerId: string;
  customerName: string;
  activeProjects: number;
  completedProjects: number;
}

export interface ProjectView {
  viewId: string;
  projectId: string;
  projectName: string;
  status: string;
  deliverableCount: number;
}

export interface DeliveryView {
  viewId: string;
  projectId: string;
  deliveryStatus: string;
  latestVersion: string;
  approvalStatus: string;
}

export interface DownloadView {
  viewId: string;
  projectId: string;
  availableDownloads: string[];
  latestDownloadAt?: string;
}

export interface CustomerPortalRuntimePayload {
  version: typeof CUSTOMER_PORTAL_RUNTIME_VERSION;
  deliveryVersion: typeof COMMERCIAL_DELIVERY_VERSION;
  customerView: CustomerView;
  projectView: ProjectView;
  deliveryView: DeliveryView;
  downloadView: DownloadView;
  summary: string;
}
