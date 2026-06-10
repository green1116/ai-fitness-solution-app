import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  PaymentReadinessRuntimeResult,
  PaymentReadinessStageResult,
} from "../shared/types";
import { PAYMENT_READINESS_VERSION } from "../shared/types";
import {
  buildPaymentReadinessDimensions,
  computeOverallReadiness,
} from "./builders";
import type { PaymentReadinessDashboardPayload } from "./types";
import { PAYMENT_READINESS_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validatePaymentReadinessDashboard(input?: {
  deploymentId?: string;
}): {
  dimensionsValid: boolean;
  overallValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const dimensions = buildPaymentReadinessDimensions({ deploymentId });
  const { overallScore, overallLevel } = computeOverallReadiness(dimensions);
  const labels = dimensions.map((dim) => dim.label);

  return {
    dimensionsValid:
      dimensions.length === 4 &&
      labels.includes("Gateway Readiness") &&
      labels.includes("Webhook Readiness") &&
      labels.includes("Subscription Readiness") &&
      labels.includes("Settlement Readiness"),
    overallValid: overallScore > 0 && overallLevel !== "not-started",
  };
}

export function runPaymentReadinessDashboardRuntime(input?: {
  deploymentId?: string;
}): PaymentReadinessRuntimeResult<PaymentReadinessDashboardPayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: PaymentReadinessStageResult[] = [];

  const dimensions = runStage(
    "readiness-dimensions",
    "Payment Readiness Dimensions",
    () => buildPaymentReadinessDimensions({ deploymentId }),
    stages,
  );
  const overall = runStage(
    "readiness-overall",
    "Overall Readiness Score",
    () => computeOverallReadiness(dimensions),
    stages,
  );

  const validation = runStage(
    "readiness-dashboard-validate",
    "Readiness Dashboard Validation",
    () => validatePaymentReadinessDashboard({ deploymentId }),
    stages,
  );

  const allValid = Object.values(validation).every(Boolean);
  if (!allValid) {
    throw new Error("Payment readiness dashboard validation failed");
  }

  const payload: PaymentReadinessDashboardPayload = {
    version: PAYMENT_READINESS_DASHBOARD_RUNTIME_VERSION,
    readinessVersion: PAYMENT_READINESS_VERSION,
    dimensions,
    overallScore: overall.overallScore,
    overallLevel: overall.overallLevel,
    summary: `payment-readiness-dashboard score=${overall.overallScore} level=${overall.overallLevel} dimensions=${dimensions.length}`,
  };

  return finalizeRuntime({
    domain: "payment-readiness",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
