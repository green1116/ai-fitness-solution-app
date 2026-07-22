/**
 * Post-Launch P4 — Deployment Approval
 * Blocks on open critical incidents from incident response
 */

import { listOperationsIncidents } from "../incident/incident.model";
import { DEPLOYMENT_APPROVAL_STATUSES } from "./release.constants";
import {
  bindReleaseApproval,
  getOperationsRelease,
  setOperationsReleaseStatus,
} from "./release.lifecycle";
import type {
  DecideDeploymentApprovalInput,
  DeploymentApproval,
  RequestDeploymentApprovalInput,
} from "./release.types";

const approvals = new Map<string, DeploymentApproval>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneApproval(approval: DeploymentApproval): DeploymentApproval {
  return { ...approval };
}

function countOpenCriticalIncidents(productionOperationId: string): number {
  return listOperationsIncidents({
    productionOperationId,
  }).filter(
    (i) =>
      (i.severity === "SEV1" || i.severity === "SEV2") &&
      i.status !== "RESOLVED" &&
      i.status !== "CLOSED",
  ).length;
}

export function requestDeploymentApproval(
  input: RequestDeploymentApprovalInput,
): DeploymentApproval {
  const operationsReleaseId = input.operationsReleaseId.trim();
  const approver = input.approver.trim();
  if (!approver) throw new Error("deploymentApproval.approver is required");

  const release = getOperationsRelease(operationsReleaseId);
  if (!release) {
    throw new Error(`operations release not found: ${operationsReleaseId}`);
  }
  if (!release.versionRecordId) {
    throw new Error(
      `version required before approval: ${operationsReleaseId}`,
    );
  }
  if (release.status !== "PLANNED" && release.status !== "DRAFT") {
    throw new Error(
      `release not approvable in status: ${release.status}`,
    );
  }

  const blockers = countOpenCriticalIncidents(release.productionOperationId);
  const id = input.id?.trim() || createId("relappr");
  if (approvals.has(id)) {
    throw new Error(`deployment approval already exists: ${id}`);
  }

  const approval: DeploymentApproval = {
    id,
    operationsReleaseId,
    status: "PENDING",
    approver,
    detail:
      input.detail?.trim() ||
      (blockers > 0
        ? `pending with ${blockers} critical incident blocker(s)`
        : "pending approval"),
    openIncidentBlockers: blockers,
    createdAt: nowIso(),
  };
  approvals.set(id, approval);
  bindReleaseApproval(operationsReleaseId, id);
  return cloneApproval(approval);
}

export function decideDeploymentApproval(
  input: DecideDeploymentApprovalInput,
): DeploymentApproval {
  const approval = approvals.get(input.approvalId.trim());
  if (!approval) {
    throw new Error(`deployment approval not found: ${input.approvalId}`);
  }
  if (approval.status !== "PENDING") {
    throw new Error(`approval not pending: ${approval.status}`);
  }

  const release = getOperationsRelease(approval.operationsReleaseId);
  if (!release) {
    throw new Error(
      `operations release not found: ${approval.operationsReleaseId}`,
    );
  }

  const blockers = countOpenCriticalIncidents(release.productionOperationId);
  approval.openIncidentBlockers = blockers;
  const now = nowIso();

  if (input.approve) {
    if (blockers > 0) {
      throw new Error(
        `cannot approve with open critical incidents: ${blockers}`,
      );
    }
    approval.status = "APPROVED";
    approval.approvedAt = now;
    approval.detail = input.detail?.trim() || "deployment approved";
    setOperationsReleaseStatus(release.id, "APPROVED", approval.detail);
  } else {
    approval.status = "REJECTED";
    approval.rejectedAt = now;
    approval.detail = input.detail?.trim() || "deployment rejected";
    setOperationsReleaseStatus(release.id, "FAILED", approval.detail);
  }

  if (
    !(DEPLOYMENT_APPROVAL_STATUSES as readonly string[]).includes(
      approval.status,
    )
  ) {
    throw new Error(`invalid approval status: ${approval.status}`);
  }

  approvals.set(approval.id, approval);
  return cloneApproval(approval);
}

export function deployApprovedRelease(
  operationsReleaseId: string,
  detail?: string,
): ReturnType<typeof getOperationsRelease> {
  const release = getOperationsRelease(operationsReleaseId.trim());
  if (!release) {
    throw new Error(`operations release not found: ${operationsReleaseId}`);
  }
  if (release.status !== "APPROVED") {
    throw new Error(`release not APPROVED: ${release.status}`);
  }
  if (!release.approvalId) {
    throw new Error(`approval missing for release: ${release.id}`);
  }
  const approval = approvals.get(release.approvalId);
  if (!approval || approval.status !== "APPROVED") {
    throw new Error(`deployment approval not APPROVED: ${release.approvalId}`);
  }

  setOperationsReleaseStatus(
    release.id,
    "DEPLOYING",
    detail?.trim() || "deploying",
  );
  return setOperationsReleaseStatus(
    release.id,
    "RELEASED",
    detail?.trim() || "released",
  );
}

export function getDeploymentApproval(
  id: string,
): DeploymentApproval | undefined {
  const approval = approvals.get(id.trim());
  return approval ? cloneApproval(approval) : undefined;
}

export function listDeploymentApprovals(filter?: {
  operationsReleaseId?: string;
  status?: DeploymentApproval["status"];
}): DeploymentApproval[] {
  let result = [...approvals.values()];
  if (filter?.operationsReleaseId) {
    const rid = filter.operationsReleaseId.trim();
    result = result.filter((a) => a.operationsReleaseId === rid);
  }
  if (filter?.status) result = result.filter((a) => a.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneApproval);
}

export function clearDeploymentApprovals(): void {
  approvals.clear();
}
