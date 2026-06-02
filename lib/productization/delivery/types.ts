export const CUSTOMER_DELIVERY_VERSION = "v8.5-customer-delivery-1" as const;

export type DeliveryStatus =
  | "initiated"
  | "planning"
  | "proposal-delivered"
  | "trial-active"
  | "implementation"
  | "completed"
  | "renewal";

export type MilestoneStatus = "planned" | "in-progress" | "completed" | "blocked";

export type DeliverableType =
  | "plan-package"
  | "budget-package"
  | "proposal-pdf"
  | "tender-package"
  | "executive-summary";

export interface CustomerProject {
  projectId: string;
  customerName: string;
  owner: string;
  status: DeliveryStatus;
  startedAt: string;
  targetCompletionAt: string;
}

export interface ProjectMilestone {
  milestoneId: string;
  name: string;
  status: MilestoneStatus;
  dueAt: string;
  owner: string;
}

export interface Deliverable {
  deliverableId: string;
  type: DeliverableType;
  name: string;
  status: MilestoneStatus;
  ready: boolean;
}

export interface SuccessMetric {
  metricId: string;
  deliveryCompletionRate: number;
  customerAdoption: number;
  workspaceUtilization: number;
  proposalAcceptance: number;
  renewalReadiness: number;
}

export interface DeliverySummary {
  summaryId: string;
  version: typeof CUSTOMER_DELIVERY_VERSION;
  projectId: string;
  overallHealth: "excellent" | "good" | "watch";
  completedMilestones: number;
  totalMilestones: number;
  readyDeliverables: number;
  totalDeliverables: number;
  summary: string;
}

export interface CustomerDeliveryResponse {
  version: typeof CUSTOMER_DELIVERY_VERSION;
  project: CustomerProject;
  milestones: ProjectMilestone[];
  deliverables: Deliverable[];
  successMetrics: SuccessMetric;
  summary: DeliverySummary;
}
