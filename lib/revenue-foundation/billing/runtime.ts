import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevenueRuntimeResult, RevenueStageResult } from "../shared/types";
import { REVENUE_FOUNDATION_VERSION } from "../shared/types";
import {
  buildBillingHistory,
  buildBillingSnapshot,
  buildBillingSummary,
} from "./builders";
import type { BillingRuntimePayload } from "./types";
import { BILLING_RUNTIME_VERSION } from "./types";

export function validateBillingRuntime(input?: { deploymentId?: string }): {
  snapshotValid: boolean;
  historyValid: boolean;
  summaryValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "billing-default";
  const snapshot = buildBillingSnapshot({ deploymentId });
  const history = buildBillingHistory({ deploymentId });
  const summary = buildBillingSummary({ deploymentId, snapshot, history });
  const kinds = new Set(history.events.map((event) => event.kind));

  return {
    snapshotValid:
      snapshot.snapshotId.length > 0 &&
      snapshot.activeSubscriptions > 0 &&
      snapshot.currency === "CNY",
    historyValid:
      history.events.length >= 3 &&
      kinds.has("subscription-started") &&
      kinds.has("invoice-issued") &&
      kinds.has("payment-received"),
    summaryValid:
      summary.totalEvents === history.events.length &&
      summary.totalCollected > 0,
  };
}

export function runBillingRuntime(input?: {
  deploymentId?: string;
}): RevenueRuntimeResult<BillingRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "billing-default";
  const stages: RevenueStageResult[] = [];

  const snapshot = runStage(
    "billing-snapshot",
    "Billing Snapshot",
    () => buildBillingSnapshot({ deploymentId }),
    stages,
  );
  const history = runStage(
    "billing-history",
    "Billing History",
    () => buildBillingHistory({ deploymentId }),
    stages,
  );
  const summary = runStage(
    "billing-summary",
    "Billing Summary",
    () => buildBillingSummary({ deploymentId, snapshot, history }),
    stages,
  );

  const validation = runStage(
    "billing-validate",
    "Billing Validation",
    () => validateBillingRuntime({ deploymentId }),
    stages,
  );

  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    throw new Error("Billing runtime validation failed");
  }

  const payload: BillingRuntimePayload = {
    version: BILLING_RUNTIME_VERSION,
    foundationVersion: REVENUE_FOUNDATION_VERSION,
    snapshot,
    history,
    summary,
  };

  return finalizeRuntime({
    domain: "billing",
    deploymentId,
    stages,
    payload,
    summary: summary.summary,
  });
}
