/**
 * Post-Launch P4 — Release Metrics
 */

import { listDeploymentApprovals } from "./release.approval";
import { listOperationsReleases } from "./release.lifecycle";
import { listRollbackWorkflows } from "./release.rollback";
import type { ReleaseMetrics } from "./release.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function computeReleaseMetrics(filter?: {
  productionOperationId?: string;
}): ReleaseMetrics {
  const releases = listOperationsReleases({
    productionOperationId: filter?.productionOperationId,
  });

  const approvedCount = releases.filter((r) =>
    ["APPROVED", "DEPLOYING", "RELEASED", "ROLLED_BACK"].includes(r.status),
  ).length;
  const releasedCount = releases.filter(
    (r) => r.status === "RELEASED" || r.status === "ROLLED_BACK",
  ).length;
  const rolledBackCount = releases.filter(
    (r) => r.status === "ROLLED_BACK",
  ).length;
  const failedCount = releases.filter((r) => r.status === "FAILED").length;

  const approvals = listDeploymentApprovals().filter((a) =>
    releases.some((r) => r.id === a.operationsReleaseId),
  );
  const pendingApprovalCount = approvals.filter(
    (a) => a.status === "PENDING",
  ).length;

  const rollbacks = listRollbackWorkflows().filter((w) =>
    releases.some((r) => r.id === w.operationsReleaseId),
  );
  const rollbackCompleteRate =
    rollbacks.length === 0
      ? 100
      : Math.round(
          (rollbacks.filter((w) => w.complete && !w.failed).length /
            rollbacks.length) *
            100,
        );

  let releaseSuccessScore = 40;
  if (releases.length === 0) {
    releaseSuccessScore = 100;
  } else {
    const successLike = releases.filter(
      (r) => r.status === "RELEASED" || r.status === "ROLLED_BACK",
    ).length;
    releaseSuccessScore += Math.round((successLike / releases.length) * 30);
    releaseSuccessScore += Math.round(rollbackCompleteRate * 0.15);
    if (failedCount === 0) releaseSuccessScore += 10;
    if (pendingApprovalCount === 0) releaseSuccessScore += 5;
  }
  releaseSuccessScore = Math.max(0, Math.min(100, releaseSuccessScore));

  return {
    productionOperationId: filter?.productionOperationId,
    releaseCount: releases.length,
    approvedCount,
    releasedCount,
    rolledBackCount,
    failedCount,
    pendingApprovalCount,
    rollbackCompleteRate,
    releaseSuccessScore,
    computedAt: nowIso(),
  };
}
