/**
 * Post-Launch P2 — Lifecycle Operations
 * Bridges commercial customer lifecycle
 */

import { transitionCustomerLifecycle } from "../../product/e12/commercial/commercial.customer";
import { CUSTOMER_LIFECYCLE_STAGES } from "../../product/e12/commercial/commercial.constants";
import { getCustomerHealthProfile, reassessCustomerHealth } from "./success.health";
import type {
  LifecycleOperation,
  RunLifecycleOperationInput,
} from "./success.types";

const operations = new Map<string, LifecycleOperation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOperation(operation: LifecycleOperation): LifecycleOperation {
  return { ...operation };
}

export function runLifecycleOperation(
  input: RunLifecycleOperationInput,
): LifecycleOperation {
  const customerHealthProfileId = input.customerHealthProfileId.trim();
  const stage = input.stage;

  const profile = getCustomerHealthProfile(customerHealthProfileId);
  if (!profile) {
    throw new Error(
      `customer health profile not found: ${customerHealthProfileId}`,
    );
  }
  if (!(CUSTOMER_LIFECYCLE_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid lifecycle stage: ${stage}`);
  }

  const commercial = transitionCustomerLifecycle({
    id: input.id?.trim() ? `${input.id.trim()}.commercial` : undefined,
    organizationId: profile.organizationId,
    productId: profile.productId,
    productTenantId: profile.productTenantId,
    stage,
    reason: input.reason?.trim() || `customer-success:${stage}`,
  });

  const id = input.id?.trim() || createId("cslifecycle");
  if (operations.has(id)) {
    throw new Error(`lifecycle operation already exists: ${id}`);
  }

  const operation: LifecycleOperation = {
    id,
    customerHealthProfileId,
    commercialLifecycleId: commercial.id,
    stage: commercial.stage,
    previousStage: commercial.previousStage,
    detail: commercial.reason || `stage=${commercial.stage}`,
    operatedAt: nowIso(),
  };
  operations.set(id, operation);

  if (stage === "ACTIVE") {
    reassessCustomerHealth(profile.id, {
      score: Math.max(profile.score, 75),
      detail: "lifecycle ACTIVE",
    });
  } else if (stage === "AT_RISK") {
    reassessCustomerHealth(profile.id, {
      score: Math.min(profile.score, 45),
      detail: "lifecycle AT_RISK",
    });
  } else if (stage === "CHURNED") {
    reassessCustomerHealth(profile.id, {
      score: 10,
      detail: "lifecycle CHURNED",
    });
  }

  return cloneOperation(operation);
}

export function getLifecycleOperation(
  id: string,
): LifecycleOperation | undefined {
  const operation = operations.get(id.trim());
  return operation ? cloneOperation(operation) : undefined;
}

export function listLifecycleOperations(filter?: {
  customerHealthProfileId?: string;
}): LifecycleOperation[] {
  let result = [...operations.values()];
  if (filter?.customerHealthProfileId) {
    const pid = filter.customerHealthProfileId.trim();
    result = result.filter((o) => o.customerHealthProfileId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOperation);
}

export function clearLifecycleOperations(): void {
  operations.clear();
}
