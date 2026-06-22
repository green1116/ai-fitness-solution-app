/**
 * V60 P2 — Customer lifecycle management
 */

import type { CustomerLifecycleStage } from "./customer.model";
import { normalizeCustomerStatus } from "./customer.model";
import { crmDb } from "../types";
import { logCRMActivity } from "../activity/activity.tracker";

const LIFECYCLE_TO_STATUS: Record<CustomerLifecycleStage, "ACTIVE" | "INACTIVE"> = {
  prospect: "ACTIVE",
  onboarding: "ACTIVE",
  active: "ACTIVE",
  expansion: "ACTIVE",
  churn_risk: "ACTIVE",
  churned: "INACTIVE",
};

export async function updateCustomerLifecycle(input: {
  customerId: string;
  organizationId: string;
  stage: CustomerLifecycleStage;
  userId?: string;
}) {
  const customer = await crmDb().customer.findFirst({
    where: { id: input.customerId, organizationId: input.organizationId },
  });
  if (!customer) {
    throw new Error("Customer not found for organization");
  }

  const status = LIFECYCLE_TO_STATUS[input.stage];
  const updated = await crmDb().customer.update({
    where: { id: input.customerId },
    data: { status },
  });

  await logCRMActivity({
    customerId: input.customerId,
    type: "lifecycle.updated",
    meta: { stage: input.stage, status, userId: input.userId },
  });

  return { ...updated, lifecycleStage: input.stage, status: normalizeCustomerStatus(updated.status) };
}

export function resolveLifecycleFromStatus(status: string): CustomerLifecycleStage {
  return normalizeCustomerStatus(status) === "ACTIVE" ? "active" : "churned";
}
