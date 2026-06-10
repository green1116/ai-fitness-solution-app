import { buildDeliverables, buildDeliveryProject } from "../workspace/builders";
import type { ApprovalRecord, ApprovalStatus } from "./types";

const STATUS_BY_TYPE: Record<string, ApprovalStatus> = {
  "proposal-pdf": "review",
  "plan-pdf": "approved",
  "budget-pdf": "approved",
  "enterprise-zip": "draft",
};

export function buildApprovalRecords(input?: { deploymentId?: string }): ApprovalRecord[] {
  const deploymentId = input?.deploymentId ?? "approval-default";
  const project = buildDeliveryProject({ deploymentId });
  const deliverables = buildDeliverables({
    deploymentId,
    projectId: project.projectId,
  });
  const now = new Date().toISOString();

  return deliverables.map((d) => ({
    recordId: `approval-${d.type}-${deploymentId}`,
    projectId: project.projectId,
    deliverableType: d.type,
    status: STATUS_BY_TYPE[d.type] ?? "draft",
    reviewer: STATUS_BY_TYPE[d.type] === "review" ? "delivery-manager" : undefined,
    updatedAt: now,
  }));
}

export function resolveCurrentApprovalStatus(records: ApprovalRecord[]): ApprovalStatus {
  if (records.every((r) => r.status === "delivered")) return "delivered";
  if (records.every((r) => r.status === "approved" || r.status === "delivered")) return "approved";
  if (records.some((r) => r.status === "review")) return "review";
  return "draft";
}
