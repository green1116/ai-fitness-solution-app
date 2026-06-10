import { finalizeRuntime, runStage } from "../shared/runtime";
import type { CustomerSuccessRuntimeResult, CustomerSuccessStageResult } from "../shared/types";
import { CUSTOMER_SUCCESS_VERSION } from "../shared/types";
import { buildCustomerHealthScores } from "./builders";
import type { CustomerHealthRuntimePayload } from "./types";
import { CUSTOMER_HEALTH_RUNTIME_VERSION } from "./types";

export function validateCustomerHealthRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const customers = buildCustomerHealthScores(input);
  return {
    valid:
      customers.length >= 3 &&
      customers.every((c) => c.overallScore >= 0 && c.overallScore <= 100),
  };
}

export function runCustomerHealthRuntime(input?: {
  deploymentId?: string;
}): CustomerSuccessRuntimeResult<CustomerHealthRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "health-default";
  const stages: CustomerSuccessStageResult[] = [];

  const customers = runStage("health-build", "Customer Health", () => buildCustomerHealthScores({ deploymentId }), stages);
  const validation = runStage("health-validate", "Health Validation", () => validateCustomerHealthRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Customer health validation failed");

  const payload: CustomerHealthRuntimePayload = {
    version: CUSTOMER_HEALTH_RUNTIME_VERSION,
    successVersion: CUSTOMER_SUCCESS_VERSION,
    customers,
    healthyCount: customers.filter((c) => c.status === "healthy").length,
    warningCount: customers.filter((c) => c.status === "warning").length,
    criticalCount: customers.filter((c) => c.status === "critical").length,
    summary: `customer-health healthy=${customers.filter((c) => c.status === "healthy").length} warning=${customers.filter((c) => c.status === "warning").length} critical=${customers.filter((c) => c.status === "critical").length}`,
  };

  return finalizeRuntime({ domain: "customer-health", deploymentId, stages, payload, summary: payload.summary });
}
