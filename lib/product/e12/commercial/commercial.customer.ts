/**
 * E12-P7 — Customer Lifecycle
 * Integrates admin organization and tenant product
 */

import { getOrganization } from "../admin/admin.organization";
import { getProductIdentity } from "../identity/product.identity";
import { getProductTenant } from "../tenant/tenant.product";
import { CUSTOMER_LIFECYCLE_STAGES } from "./commercial.constants";
import type {
  CustomerLifecycleRecord,
  CustomerLifecycleStage,
  TransitionCustomerLifecycleInput,
} from "./commercial.types";

const lifecycles = new Map<string, CustomerLifecycleRecord>();
const currentStageByOrg = new Map<string, CustomerLifecycleStage>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function orgKey(organizationId: string, productId: string): string {
  return `${organizationId}:${productId}`;
}

function cloneRecord(record: CustomerLifecycleRecord): CustomerLifecycleRecord {
  return { ...record, metadata: { ...record.metadata } };
}

export function transitionCustomerLifecycle(
  input: TransitionCustomerLifecycleInput,
): CustomerLifecycleRecord {
  const organizationId = input.organizationId.trim();
  const productId = input.productId.trim();
  const stage = input.stage;

  const org = getOrganization(organizationId);
  if (!org || org.productId !== productId) {
    throw new Error(`organization not found: ${organizationId}`);
  }
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }
  if (!(CUSTOMER_LIFECYCLE_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid lifecycle stage: ${stage}`);
  }

  if (input.productTenantId) {
    const tenant = getProductTenant(input.productTenantId.trim());
    if (!tenant || tenant.productId !== productId) {
      throw new Error(`product tenant not found: ${input.productTenantId}`);
    }
  }

  const key = orgKey(organizationId, productId);
  const previousStage = currentStageByOrg.get(key);

  const id = input.id?.trim() || createId("custlc");
  if (lifecycles.has(id)) {
    throw new Error(`lifecycle record already exists: ${id}`);
  }

  const record: CustomerLifecycleRecord = {
    id,
    organizationId,
    productId,
    productTenantId: input.productTenantId?.trim() || undefined,
    stage,
    previousStage,
    reason: input.reason?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    transitionedAt: nowIso(),
  };
  lifecycles.set(id, record);
  currentStageByOrg.set(key, stage);
  return cloneRecord(record);
}

export function getCustomerLifecycleStage(
  organizationId: string,
  productId: string,
): CustomerLifecycleStage | undefined {
  return currentStageByOrg.get(
    orgKey(organizationId.trim(), productId.trim()),
  );
}

export function listCustomerLifecycleRecords(filter?: {
  organizationId?: string;
  productId?: string;
  stage?: CustomerLifecycleStage;
}): CustomerLifecycleRecord[] {
  let result = [...lifecycles.values()];
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((r) => r.organizationId === oid);
  }
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((r) => r.productId === pid);
  }
  if (filter?.stage) result = result.filter((r) => r.stage === filter.stage);
  return result
    .slice()
    .sort((a, b) => a.transitionedAt.localeCompare(b.transitionedAt))
    .map(cloneRecord);
}

export function listActiveCustomers(productId?: string): string[] {
  const keys = [...currentStageByOrg.entries()].filter(([, stage]) => {
    return stage === "ACTIVE" || stage === "ONBOARDING";
  });
  return keys
    .filter(([key]) => !productId || key.endsWith(`:${productId.trim()}`))
    .map(([key]) => key.split(":")[0]!)
    .sort();
}

export function clearCustomerLifecycles(): void {
  lifecycles.clear();
  currentStageByOrg.clear();
}
