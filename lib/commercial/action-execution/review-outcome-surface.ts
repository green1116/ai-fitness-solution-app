/**
 * EPV-2 — Workspace Review Outcome Surface
 * Maps frozen EWXR SUCCESS onto existing ESCS-4 CustomerSuccessReview.
 * No new action / execution engine / persistence / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  getCustomerSuccessReview,
  type CustomerSuccessReviewStatus,
} from "../customer-success/customer-success-review";
import { getActionIntents } from "../action-intent/action-intent";
import type { ControlledActionResultKind } from "./controlled-action";
import type { WorkspaceReviewActionResult } from "./workspace-review-action";

export const EPV_2_ID = "EPV-2" as const;
export const REVIEW_OUTCOME_SURFACE_CAPABILITY =
  "WorkspaceReviewOutcomeSurface" as const;
export const REVIEW_OUTCOME_SURFACE_VERSION =
  "epv-2-review-outcome-surface-1" as const;

export const REVIEW_OUTCOME_KINDS = [
  "SHOWN",
  "EMPTY",
  "BLOCKED",
  "FAILED",
] as const;
export type ReviewOutcomeKind = (typeof REVIEW_OUTCOME_KINDS)[number];

export type WorkspaceReviewOutcomeSurface = Readonly<{
  workPackageId: typeof EPV_2_ID;
  capability: typeof REVIEW_OUTCOME_SURFACE_CAPABILITY;
  version: typeof REVIEW_OUTCOME_SURFACE_VERSION;
  surfaceItemId: string;
  actionResult: ControlledActionResultKind;
  outcome: ReviewOutcomeKind;
  reviewStatus: CustomerSuccessReviewStatus | null;
  reviewFingerprint: string | null;
  reviewReason: string | null;
  fingerprint: string;
  scope: {
    consumeFrozenOnly: true;
    noNewAction: true;
    noExecutionEngine: true;
    noPersistence: true;
    noPrisma: true;
    noFrozenLayerChanges: true;
  };
}>;

function cloneOutcome(
  row: WorkspaceReviewOutcomeSurface,
): WorkspaceReviewOutcomeSurface {
  return { ...row, scope: { ...row.scope } };
}

function outcomeFingerprint(
  row: Omit<WorkspaceReviewOutcomeSurface, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        workPackageId: row.workPackageId,
        capability: row.capability,
        version: row.version,
        surfaceItemId: row.surfaceItemId,
        actionResult: row.actionResult,
        outcome: row.outcome,
        reviewStatus: row.reviewStatus,
        reviewFingerprint: row.reviewFingerprint,
        reviewReason: row.reviewReason,
        scope: row.scope,
      }),
    )
    .digest("hex");
}

function finish(
  row: Omit<WorkspaceReviewOutcomeSurface, "fingerprint">,
): WorkspaceReviewOutcomeSurface {
  return cloneOutcome({
    ...row,
    fingerprint: outcomeFingerprint(row),
  });
}

function base(
  action: WorkspaceReviewActionResult,
): Omit<
  WorkspaceReviewOutcomeSurface,
  | "fingerprint"
  | "outcome"
  | "reviewStatus"
  | "reviewFingerprint"
  | "reviewReason"
> {
  return {
    workPackageId: EPV_2_ID,
    capability: REVIEW_OUTCOME_SURFACE_CAPABILITY,
    version: REVIEW_OUTCOME_SURFACE_VERSION,
    surfaceItemId: action.surfaceItemId,
    actionResult: action.result,
    scope: {
      consumeFrozenOnly: true,
      noNewAction: true,
      noExecutionEngine: true,
      noPersistence: true,
      noPrisma: true,
      noFrozenLayerChanges: true,
    },
  };
}

export function mapWorkspaceReviewOutcome(
  action: WorkspaceReviewActionResult,
): WorkspaceReviewOutcomeSurface {
  const root = base(action);

  if (action.result === "BLOCKED") {
    return finish({
      ...root,
      outcome: "BLOCKED",
      reviewStatus: null,
      reviewFingerprint: null,
      reviewReason: null,
    });
  }

  if (action.result !== "SUCCESS") {
    return finish({
      ...root,
      outcome: "FAILED",
      reviewStatus: null,
      reviewFingerprint: null,
      reviewReason: null,
    });
  }

  const customerId = getActionIntents().records.find(
    (row) => row.surfaceItemId === action.surfaceItemId,
  )?.customerId;
  const record = customerId
    ? getCustomerSuccessReview().records.find(
        (row) => row.customerId === customerId,
      )
    : undefined;

  if (!record) {
    return finish({
      ...root,
      outcome: "EMPTY",
      reviewStatus: null,
      reviewFingerprint: null,
      reviewReason: null,
    });
  }

  return finish({
    ...root,
    outcome: "SHOWN",
    reviewStatus: record.reviewStatus,
    reviewFingerprint: record.fingerprint,
    reviewReason: record.reason,
  });
}
