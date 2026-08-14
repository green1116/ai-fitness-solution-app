/**
 * EWER-1 — Controlled Real Action
 * Consumes exactly one EWEB READY REVIEW request via existing
 * getCustomerSuccessReview (ESCS-4). No executor / batch / Prisma / frozen-layer mutation.
 */

import { createHash } from "node:crypto";

import {
  getCustomerSuccessReview,
  type CustomerSuccessReviewRecord,
  type CustomerSuccessReviewStatus,
} from "../customer-success/customer-success-review";
import type { ActionIntentKind } from "../action-intent/action-intent";
import type { ActionExecutionRequest } from "./action-execution";

export const EWER_1_ID = "EWER-1" as const;
export const CONTROLLED_ACTION_CAPABILITY = "ControlledRealAction" as const;
export const CONTROLLED_ACTION_VERSION = "ewer-1-controlled-action-1" as const;
export const SUPPORTED_CONTROLLED_ACTION_INTENT = "REVIEW" as const;
export const CONTROLLED_ACTION_API = "getCustomerSuccessReview" as const;

export const CONTROLLED_ACTION_RESULTS = [
  "SUCCESS",
  "BLOCKED",
  "FAILED",
] as const;
export type ControlledActionResultKind =
  (typeof CONTROLLED_ACTION_RESULTS)[number];

export type ControlledActionResult = Readonly<{
  workPackageId: typeof EWER_1_ID;
  capability: typeof CONTROLLED_ACTION_CAPABILITY;
  version: typeof CONTROLLED_ACTION_VERSION;
  supportedIntent: typeof SUPPORTED_CONTROLLED_ACTION_INTENT;
  api: typeof CONTROLLED_ACTION_API;
  requestId: string;
  intentId: string;
  actionId: string;
  customerId: string;
  intent: ActionIntentKind;
  requestState: ActionExecutionRequest["requestState"];
  result: ControlledActionResultKind;
  executed: boolean;
  apiInvoked: boolean;
  reviewStatus: CustomerSuccessReviewStatus | null;
  reviewFingerprint: string | null;
  reason: string;
  fingerprint: string;
  scope: {
    singleActionType: true;
    noExecutionEngine: true;
    noBatch: true;
    noPersistenceRedesign: true;
    noPrisma: true;
    noFrozenLayerChanges: true;
    idempotent: true;
  };
}>;

function cloneResult(row: ControlledActionResult): ControlledActionResult {
  return {
    ...row,
    scope: { ...row.scope },
  };
}

function resultFingerprint(
  row: Omit<ControlledActionResult, "fingerprint">,
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        workPackageId: row.workPackageId,
        capability: row.capability,
        version: row.version,
        supportedIntent: row.supportedIntent,
        api: row.api,
        requestId: row.requestId,
        intentId: row.intentId,
        actionId: row.actionId,
        customerId: row.customerId,
        intent: row.intent,
        requestState: row.requestState,
        result: row.result,
        executed: row.executed,
        apiInvoked: row.apiInvoked,
        reviewStatus: row.reviewStatus,
        reviewFingerprint: row.reviewFingerprint,
        reason: row.reason,
        scope: row.scope,
      }),
    )
    .digest("hex");
}

function finish(
  row: Omit<ControlledActionResult, "fingerprint">,
): ControlledActionResult {
  return cloneResult({
    ...row,
    fingerprint: resultFingerprint(row),
  });
}

function baseFromRequest(
  request: ActionExecutionRequest,
): Omit<
  ControlledActionResult,
  | "fingerprint"
  | "result"
  | "executed"
  | "apiInvoked"
  | "reviewStatus"
  | "reviewFingerprint"
  | "reason"
> {
  return {
    workPackageId: EWER_1_ID,
    capability: CONTROLLED_ACTION_CAPABILITY,
    version: CONTROLLED_ACTION_VERSION,
    supportedIntent: SUPPORTED_CONTROLLED_ACTION_INTENT,
    api: CONTROLLED_ACTION_API,
    requestId: request.id,
    intentId: request.intentId,
    actionId: request.actionId,
    customerId: request.customerId,
    intent: request.intent,
    requestState: request.requestState,
    scope: {
      singleActionType: true,
      noExecutionEngine: true,
      noBatch: true,
      noPersistenceRedesign: true,
      noPrisma: true,
      noFrozenLayerChanges: true,
      idempotent: true,
    },
  };
}

function lookupReview(
  customerId: string,
): CustomerSuccessReviewRecord | undefined {
  return getCustomerSuccessReview().records.find(
    (row) => row.customerId === customerId,
  );
}

/**
 * Execute one controlled real action: READY REVIEW only.
 * BLOCKED requests are not executed. Other intents fail without invoking the API.
 */
export function executeControlledAction(
  request: ActionExecutionRequest,
): ControlledActionResult {
  const base = baseFromRequest(request);

  if (request.requestState === "BLOCKED") {
    return finish({
      ...base,
      result: "BLOCKED",
      executed: false,
      apiInvoked: false,
      reviewStatus: null,
      reviewFingerprint: null,
      reason: "blocked-request-not-executed",
    });
  }

  if (request.intent !== SUPPORTED_CONTROLLED_ACTION_INTENT) {
    return finish({
      ...base,
      result: "FAILED",
      executed: false,
      apiInvoked: false,
      reviewStatus: null,
      reviewFingerprint: null,
      reason: "unsupported-intent",
    });
  }

  if (request.requestState !== "READY") {
    return finish({
      ...base,
      result: "FAILED",
      executed: false,
      apiInvoked: false,
      reviewStatus: null,
      reviewFingerprint: null,
      reason: "request-not-ready",
    });
  }

  const review = lookupReview(request.customerId);
  if (!review) {
    return finish({
      ...base,
      result: "FAILED",
      executed: false,
      apiInvoked: true,
      reviewStatus: null,
      reviewFingerprint: null,
      reason: "review-record-missing",
    });
  }

  return finish({
    ...base,
    result: "SUCCESS",
    executed: true,
    apiInvoked: true,
    reviewStatus: review.reviewStatus,
    reviewFingerprint: review.fingerprint,
    reason: "customer-success-review-consumed",
  });
}
