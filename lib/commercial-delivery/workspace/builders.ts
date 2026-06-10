import type {
  Deliverable,
  DeliveryJob,
  DeliveryProject,
  DeliveryStatus,
  DeliveryWorkspace,
} from "./types";
import { DELIVERY_STATUSES } from "./types";

const DELIVERABLE_TYPES: Deliverable["type"][] = [
  "proposal-pdf",
  "plan-pdf",
  "budget-pdf",
  "enterprise-zip",
];

const DELIVERABLE_LABELS: Record<Deliverable["type"], string> = {
  "proposal-pdf": "Proposal PDF 投标方案",
  "plan-pdf": "Plan PDF 平面图",
  "budget-pdf": "Budget PDF 预算清单",
  "enterprise-zip": "Enterprise ZIP 交付包",
};

export function buildDeliveryProject(input?: { deploymentId?: string }): DeliveryProject {
  const deploymentId = input?.deploymentId ?? "workspace-default";
  return {
    projectId: `cdp-project-${deploymentId}`,
    projectName: "政府健身中心健身器材采购项目",
    customerName: "某市体育局",
    status: "in-progress",
    createdAt: new Date().toISOString(),
  };
}

export function buildDeliveryJob(input: {
  deploymentId: string;
  projectId: string;
}): DeliveryJob {
  return {
    jobId: `cdp-job-${input.deploymentId}`,
    projectId: input.projectId,
    jobType: "full-delivery",
    status: "in-progress",
    autopilotRef: `autopilot-job-${input.deploymentId}`,
  };
}

export function buildDeliverables(input: {
  deploymentId: string;
  projectId: string;
  status?: DeliveryStatus;
}): Deliverable[] {
  const status = input.status ?? "in-progress";
  return DELIVERABLE_TYPES.map((type) => ({
    deliverableId: `deliverable-${type}-${input.deploymentId}`,
    projectId: input.projectId,
    type,
    label: DELIVERABLE_LABELS[type],
    status: type === "enterprise-zip" ? "pending" : status,
  }));
}

export function buildDeliveryWorkspace(input?: {
  deploymentId?: string;
}): DeliveryWorkspace {
  const deploymentId = input?.deploymentId ?? "workspace-default";
  const project = buildDeliveryProject({ deploymentId });
  const job = buildDeliveryJob({ deploymentId, projectId: project.projectId });
  const deliverables = buildDeliverables({
    deploymentId,
    projectId: project.projectId,
  });

  return {
    workspaceId: `workspace-${deploymentId}`,
    project,
    job,
    deliverables,
    deliveryStatus: "in-progress",
    mode: "readiness-stub",
  };
}

