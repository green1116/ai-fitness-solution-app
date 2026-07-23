/**
 * Operations O1 — Customer registry
 */

import { CUSTOMER_STATUSES } from "../success/success.constants";
import type {
  CustomerStatus,
  RegisterCustomerInput,
  SuccessCustomer,
} from "./customer.types";

const customers = new Map<string, SuccessCustomer>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCustomer(customer: SuccessCustomer): SuccessCustomer {
  return { ...customer, metadata: { ...customer.metadata } };
}

export function registerCustomer(
  input: RegisterCustomerInput,
): SuccessCustomer {
  const name = input.name.trim();
  const accountRef = input.accountRef.trim();
  const owner = input.owner.trim();
  if (!name) throw new Error("customer.name is required");
  if (!accountRef) throw new Error("customer.accountRef is required");
  if (!owner) throw new Error("customer.owner is required");

  const status: CustomerStatus = input.status ?? "ONBOARDING";
  if (!(CUSTOMER_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid customer status: ${status}`);
  }

  const id = input.id?.trim() || createId("o1cus");
  if (customers.has(id)) {
    throw new Error(`customer already exists: ${id}`);
  }

  const now = nowIso();
  const customer: SuccessCustomer = {
    id,
    name,
    accountRef,
    owner,
    status,
    detail: `status=${status} account=${accountRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  customers.set(id, customer);
  return cloneCustomer(customer);
}

export function getCustomer(id: string): SuccessCustomer | undefined {
  const customer = customers.get(id.trim());
  return customer ? cloneCustomer(customer) : undefined;
}

export function listCustomers(filter?: {
  status?: CustomerStatus;
  accountRef?: string;
}): SuccessCustomer[] {
  let result = [...customers.values()];
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((c) => c.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCustomer);
}

export function clearCustomers(): void {
  customers.clear();
}
