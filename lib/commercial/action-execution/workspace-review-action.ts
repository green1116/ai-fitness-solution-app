/**
 * EWXR-1 — Workspace REVIEW Action
 * Connects one Workspace surface REVIEW item to frozen EWER-1.
 * No execution engine / batch / persistence / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import { getActionIntents } from "../action-intent/action-intent";
import { getActionExecutionRequests } from "./action-execution";
import {
  SUPPORTED_CONTROLLED_ACTION_INTENT,
  executeControlledAction,
  type ControlledActionResultKind,
} from "./controlled-action";

export const EWXR_1_ID = "EWXR-1" as const;
export const WORKSPACE_REVIEW_ACTION_CAPABILITY =
  "WorkspaceReviewAction" as const;
export const WORKSPACE_REVIEW_ACTION_VERSION =
  "ewxr-1-workspace-review-action-1" as const;

export type WorkspaceReviewActionResult = Readonly<{
  workPackageId: typeof EWXR_1_ID;
  capability: typeof WORKSPACE_REVIEW_ACTION_CAPABILITY;
  version: typeof WORKSPACE_REVIEW_ACTION_VERSION;
  surfaceItemId: string;
  requestId: string | null;
  result: ControlledActionResultKind;
  executed: boolean;
  ewerFingerprint: string | null;
  reason: string;
  fingerprint: string;
  scope: {
    reviewOnly: true;
    noExecutionEngine: true;
    noBatch: true;
    noPersistence: true;
    noPrisma: true;
    noFrozenLayerChanges: true;
  };
}>;

function cloneResult(
  row: WorkspaceReviewActionResult,
): WorkspaceReviewActionResult {
  return { ...row, scope: { ...row.scope } };
}

function resultFingerprint(
  row: Omit<WorkspaceReviewActionResult, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        workPackageId: row.workPackageId,
        capability: row.capability,
        version: row.version,
        surfaceItemId: row.surfaceItemId,
        requestId: row.requestId,
        result: row.result,
        executed: row.executed,
        ewerFingerprint: row.ewerFingerprint,
        reason: row.reason,
        scope: row.scope,
      }),
    )
    .digest("hex");
}

function finish(
  row: Omit<WorkspaceReviewActionResult, "fingerprint">,
): WorkspaceReviewActionResult {
  return cloneResult({
    ...row,
    fingerprint: resultFingerprint(row),
  });
}

function base(
  surfaceItemId: string,
): Omit<
  WorkspaceReviewActionResult,
  | "fingerprint"
  | "requestId"
  | "result"
  | "executed"
  | "ewerFingerprint"
  | "reason"
> {
  return {
    workPackageId: EWXR_1_ID,
    capability: WORKSPACE_REVIEW_ACTION_CAPABILITY,
    version: WORKSPACE_REVIEW_ACTION_VERSION,
    surfaceItemId,
    scope: {
      reviewOnly: true,
      noExecutionEngine: true,
      noBatch: true,
      noPersistence: true,
      noPrisma: true,
      noFrozenLayerChanges: true,
    },
  };
}

export function listWorkspaceReviewSurfaceItemIds(): readonly string[] {
  return getActionIntents()
    .records.filter(
      (row) => row.intent === SUPPORTED_CONTROLLED_ACTION_INTENT,
    )
    .map((row) => row.surfaceItemId);
}

export function runWorkspaceReviewAction(
  surfaceItemId: string,
): WorkspaceReviewActionResult {
  const id = surfaceItemId.trim();
  if (!id) {
    return finish({
      ...base(id),
      requestId: null,
      result: "FAILED",
      executed: false,
      ewerFingerprint: null,
      reason: "surface-item-missing",
    });
  }

  const intent = getActionIntents().records.find(
    (row) => row.surfaceItemId === id,
  );
  if (!intent || intent.intent !== SUPPORTED_CONTROLLED_ACTION_INTENT) {
    return finish({
      ...base(id),
      requestId: null,
      result: "FAILED",
      executed: false,
      ewerFingerprint: null,
      reason: "workspace-item-not-review",
    });
  }

  const request = getActionExecutionRequests().records.find(
    (row) => row.intentId === intent.id,
  );
  if (!request) {
    return finish({
      ...base(id),
      requestId: null,
      result: "FAILED",
      executed: false,
      ewerFingerprint: null,
      reason: "execution-request-missing",
    });
  }

  const controlled = executeControlledAction(request);
  return finish({
    ...base(id),
    requestId: request.id,
    result: controlled.result,
    executed: controlled.executed,
    ewerFingerprint: controlled.fingerprint,
    reason: controlled.reason,
  });
}
