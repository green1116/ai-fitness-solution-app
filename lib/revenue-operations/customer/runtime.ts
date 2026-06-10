import { finalizeRuntime, runStage } from "../shared/runtime";
import type { RevOpsRuntimeResult, RevOpsStageResult } from "../shared/types";
import { REVENUE_OPERATIONS_VERSION } from "../shared/types";
import { buildCustomerProfiles } from "./builders";
import type { CustomerRuntimePayload } from "./types";
import { CUSTOMER_RUNTIME_VERSION } from "./types";

export function validateCustomerRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const customers = buildCustomerProfiles(input);
  return { valid: customers.length >= 3 && customers.some((c) => c.tier === "enterprise") };
}

export function runCustomerRuntime(input?: { deploymentId?: string }): RevOpsRuntimeResult<CustomerRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "customer-default";
  const stages: RevOpsStageResult[] = [];

  const customers = runStage("customer-build", "Customer Profiles", () => buildCustomerProfiles({ deploymentId }), stages);
  const validation = runStage("customer-validate", "Customer Validation", () => validateCustomerRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Customer runtime validation failed");

  const payload: CustomerRuntimePayload = {
    version: CUSTOMER_RUNTIME_VERSION,
    revOpsVersion: REVENUE_OPERATIONS_VERSION,
    customers,
    customerCount: customers.length,
    summary: `customer-runtime count=${customers.length} enterprise=${customers.filter((c) => c.tier === "enterprise").length}`,
  };

  return finalizeRuntime({ domain: "customer-runtime", deploymentId, stages, payload, summary: payload.summary });
}
