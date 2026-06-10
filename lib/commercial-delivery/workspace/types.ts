import type { COMMERCIAL_DELIVERY_VERSION, ReadinessStubMode } from "../shared/types";

export const DELIVERY_WORKSPACE_RUNTIME_VERSION = "v14.0-delivery-workspace-1" as const;

export const DELIVERY_STATUSES = [
  "pending",
  "in-progress",
  "ready-for-review",
  "approved",
  "delivered",
] as const;

export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export interface DeliveryProject {
  projectId: string;
  projectName: string;
  customerName: string;
  status: DeliveryStatus;
  createdAt: string;
}

export interface DeliveryJob {
  jobId: string;
  projectId: string;
  jobType: string;
  status: DeliveryStatus;
  autopilotRef: string;
}

export interface Deliverable {
  deliverableId: string;
  projectId: string;
  type: "proposal-pdf" | "plan-pdf" | "budget-pdf" | "enterprise-zip";
  label: string;
  status: DeliveryStatus;
}

export interface DeliveryWorkspace {
  workspaceId: string;
  project: DeliveryProject;
  job: DeliveryJob;
  deliverables: Deliverable[];
  deliveryStatus: DeliveryStatus;
  mode: ReadinessStubMode;
}

export interface DeliveryWorkspaceRuntimePayload {
  version: typeof DELIVERY_WORKSPACE_RUNTIME_VERSION;
  deliveryVersion: typeof COMMERCIAL_DELIVERY_VERSION;
  workspace: DeliveryWorkspace;
  summary: string;
}
