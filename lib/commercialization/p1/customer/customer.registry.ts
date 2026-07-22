/**
 * Commercialization P1 — Customer registry
 */

import { CUSTOMER_LIFECYCLE_STAGES } from "../sales/sales.constants";
import type {
  CustomerLifecycleStage,
  RegisterCustomerInput,
  SalesCustomer,
} from "./customer.types";

const customers = new Map<string, SalesCustomer>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCustomer(customer: SalesCustomer): SalesCustomer {
  return { ...customer, metadata: { ...customer.metadata } };
}

function scoreForStage(stage: CustomerLifecycleStage): number {
  const map: Record<CustomerLifecycleStage, number> = {
    PROSPECT: 40,
    ACTIVE: 75,
    EXPANSION: 88,
    CHURN_RISK: 35,
    CHURNED: 10,
  };
  return map[stage];
}

export function registerCustomer(
  input: RegisterCustomerInput,
): SalesCustomer {
  const name = input.name.trim();
  if (!name) throw new Error("customer.name is required");

  const lifecycleStage: CustomerLifecycleStage =
    input.lifecycleStage ?? "PROSPECT";
  if (
    !(CUSTOMER_LIFECYCLE_STAGES as readonly string[]).includes(lifecycleStage)
  ) {
    throw new Error(`invalid lifecycle stage: ${lifecycleStage}`);
  }

  const id = input.id?.trim() || createId("cust");
  if (customers.has(id)) {
    throw new Error(`customer already exists: ${id}`);
  }

  const now = nowIso();
  const customer: SalesCustomer = {
    id,
    name,
    segment: (input.segment ?? "GENERAL").trim() || "GENERAL",
    region: (input.region ?? "GLOBAL").trim() || "GLOBAL",
    lifecycleStage,
    healthScore: scoreForStage(lifecycleStage),
    detail: `stage=${lifecycleStage} segment=${(input.segment ?? "GENERAL").trim() || "GENERAL"}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  customers.set(id, customer);
  return cloneCustomer(customer);
}

export function setCustomerLifecycleStage(
  id: string,
  stage: CustomerLifecycleStage,
): SalesCustomer {
  const customer = customers.get(id.trim());
  if (!customer) throw new Error(`customer not found: ${id}`);
  if (!(CUSTOMER_LIFECYCLE_STAGES as readonly string[]).includes(stage)) {
    throw new Error(`invalid lifecycle stage: ${stage}`);
  }
  customer.lifecycleStage = stage;
  customer.healthScore = scoreForStage(stage);
  customer.updatedAt = nowIso();
  customer.detail = `stage=${stage} segment=${customer.segment}`;
  customers.set(customer.id, customer);
  return cloneCustomer(customer);
}

export function getSalesCustomer(id: string): SalesCustomer | undefined {
  const customer = customers.get(id.trim());
  return customer ? cloneCustomer(customer) : undefined;
}

export function listSalesCustomers(filter?: {
  lifecycleStage?: CustomerLifecycleStage;
  segment?: string;
}): SalesCustomer[] {
  let result = [...customers.values()];
  if (filter?.lifecycleStage) {
    result = result.filter((c) => c.lifecycleStage === filter.lifecycleStage);
  }
  if (filter?.segment) {
    const seg = filter.segment.trim();
    result = result.filter((c) => c.segment === seg);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCustomer);
}

export function clearSalesCustomers(): void {
  customers.clear();
}
