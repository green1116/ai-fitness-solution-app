import { finalizeRuntime, runStage } from "../shared/runtime";
import type { CustomerSuccessRuntimeResult, CustomerSuccessStageResult } from "../shared/types";
import { CUSTOMER_SUCCESS_VERSION } from "../shared/types";
import { buildCustomerSuccessDashboardMetrics } from "./builders";
import type { CustomerSuccessDashboardRuntimePayload } from "./types";
import { CUSTOMER_SUCCESS_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateCustomerSuccessDashboardRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const metrics = buildCustomerSuccessDashboardMetrics(input);
  return {
    valid:
      metrics.customerHealth > 0 &&
      metrics.adoptionHealth > 0 &&
      metrics.expansionHealth > 0,
  };
}

export function runCustomerSuccessDashboardRuntime(input?: {
  deploymentId?: string;
}): CustomerSuccessRuntimeResult<CustomerSuccessDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: CustomerSuccessStageResult[] = [];

  const metrics = runStage(
    "cs-dashboard-metrics",
    "Customer Success Dashboard",
    () => buildCustomerSuccessDashboardMetrics({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "cs-dashboard-validate",
    "Dashboard Validation",
    () => validateCustomerSuccessDashboardRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Customer success dashboard validation failed");

  const payload: CustomerSuccessDashboardRuntimePayload = {
    version: CUSTOMER_SUCCESS_DASHBOARD_RUNTIME_VERSION,
    successVersion: CUSTOMER_SUCCESS_VERSION,
    customerHealth: metrics.customerHealth,
    adoptionHealth: metrics.adoptionHealth,
    renewalHealth: metrics.renewalHealth,
    expansionHealth: metrics.expansionHealth,
    summary: metrics.summary,
  };

  return finalizeRuntime({
    domain: "customer-success-dashboard",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
