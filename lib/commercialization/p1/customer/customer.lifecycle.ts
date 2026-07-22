/**
 * Commercialization P1 — Customer lifecycle
 */

import { CUSTOMER_LIFECYCLE_STAGES } from "../sales/sales.constants";
import {
  getSalesCustomer,
  setCustomerLifecycleStage,
} from "./customer.registry";
import type {
  CustomerLifecycleRecord,
  CustomerLifecycleStage,
  TransitionCustomerLifecycleInput,
} from "./customer.types";

const lifecycles = new Map<string, CustomerLifecycleRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecord(
  record: CustomerLifecycleRecord,
): CustomerLifecycleRecord {
  return { ...record };
}

export function transitionCustomerLifecycle(
  input: TransitionCustomerLifecycleInput,
): CustomerLifecycleRecord {
  const customerId = input.customerId.trim();
  const customer = getSalesCustomer(customerId);
  if (!customer) {
    throw new Error(`customer not found: ${customerId}`);
  }

  const stage = input.stage;
  if (!(CUSTOMER_LIFECYCLE_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid lifecycle stage: ${stage}`);
  }

  const previousStage = customer.lifecycleStage;
  setCustomerLifecycleStage(customerId, stage);

  const id = input.id?.trim() || createId("clife");
  if (lifecycles.has(id)) {
    throw new Error(`customer lifecycle record already exists: ${id}`);
  }

  const record: CustomerLifecycleRecord = {
    id,
    customerId,
    stage,
    previousStage,
    reason: (input.reason ?? `transition ${previousStage}→${stage}`).trim(),
    transitionedAt: nowIso(),
  };
  lifecycles.set(id, record);
  return cloneRecord(record);
}

export function getCustomerLifecycleRecord(
  id: string,
): CustomerLifecycleRecord | undefined {
  const record = lifecycles.get(id.trim());
  return record ? cloneRecord(record) : undefined;
}

export function listCustomerLifecycleRecords(filter?: {
  customerId?: string;
  stage?: CustomerLifecycleStage;
}): CustomerLifecycleRecord[] {
  let result = [...lifecycles.values()];
  if (filter?.customerId) {
    const cid = filter.customerId.trim();
    result = result.filter((r) => r.customerId === cid);
  }
  if (filter?.stage) result = result.filter((r) => r.stage === filter.stage);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRecord);
}

export function clearCustomerLifecycleRecords(): void {
  lifecycles.clear();
}
