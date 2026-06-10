import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  CommercialDeliveryRuntimeResult,
  CommercialDeliveryStageResult,
} from "../shared/types";
import { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";
import { buildCustomerPortalViews } from "./builders";
import type { CustomerPortalRuntimePayload } from "./types";
import { CUSTOMER_PORTAL_RUNTIME_VERSION } from "./types";

export function validateCustomerPortalRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const views = buildCustomerPortalViews(input);
  return {
    valid:
      views.customerView.customerName.length > 0 &&
      views.projectView.deliverableCount === 4 &&
      views.downloadView.availableDownloads.length === 4,
  };
}

export function runCustomerPortalRuntime(input?: {
  deploymentId?: string;
}): CommercialDeliveryRuntimeResult<CustomerPortalRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "portal-default";
  const stages: CommercialDeliveryStageResult[] = [];

  const views = runStage(
    "customer-portal-views",
    "Customer Portal Views",
    () => buildCustomerPortalViews({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "customer-portal-validate",
    "Portal Validation",
    () => validateCustomerPortalRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Customer portal validation failed");

  const payload: CustomerPortalRuntimePayload = {
    version: CUSTOMER_PORTAL_RUNTIME_VERSION,
    deliveryVersion: COMMERCIAL_DELIVERY_VERSION,
    ...views,
    summary: `customer-portal customer=${views.customerView.customerName} project=${views.projectView.projectName} downloads=${views.downloadView.availableDownloads.length}`,
  };

  return finalizeRuntime({
    domain: "customer-portal",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
