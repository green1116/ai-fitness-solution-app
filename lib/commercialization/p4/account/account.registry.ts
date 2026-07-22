/**
 * Commercialization P4 — Account registry
 */

import { ACCOUNT_STATUSES } from "../onboarding/onboarding.constants";
import type {
  AccountStatus,
  CustomerAccount,
  RegisterAccountInput,
} from "./account.types";

const accounts = new Map<string, CustomerAccount>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAccount(account: CustomerAccount): CustomerAccount {
  return { ...account, metadata: { ...account.metadata } };
}

export function registerAccount(
  input: RegisterAccountInput,
): CustomerAccount {
  const name = input.name.trim();
  const customerRef = input.customerRef.trim();
  const contractRef = input.contractRef.trim();
  if (!name) throw new Error("account.name is required");
  if (!customerRef) throw new Error("account.customerRef is required");
  if (!contractRef) throw new Error("account.contractRef is required");

  const status: AccountStatus = input.status ?? "PROSPECT";
  if (!(ACCOUNT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid account status: ${status}`);
  }

  const id = input.id?.trim() || createId("acct");
  if (accounts.has(id)) {
    throw new Error(`account already exists: ${id}`);
  }

  const now = nowIso();
  const account: CustomerAccount = {
    id,
    name,
    customerRef,
    contractRef,
    status,
    owner: (input.owner ?? "unassigned").trim() || "unassigned",
    detail: `status=${status} customer=${customerRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  accounts.set(id, account);
  return cloneAccount(account);
}

export function setAccountStatus(
  id: string,
  status: AccountStatus,
): CustomerAccount {
  const account = accounts.get(id.trim());
  if (!account) throw new Error(`account not found: ${id}`);
  if (!(ACCOUNT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid account status: ${status}`);
  }
  account.status = status;
  account.updatedAt = nowIso();
  account.detail = `status=${status} customer=${account.customerRef}`;
  accounts.set(account.id, account);
  return cloneAccount(account);
}

export function getCustomerAccount(id: string): CustomerAccount | undefined {
  const account = accounts.get(id.trim());
  return account ? cloneAccount(account) : undefined;
}

export function listCustomerAccounts(filter?: {
  status?: AccountStatus;
  customerRef?: string;
}): CustomerAccount[] {
  let result = [...accounts.values()];
  if (filter?.status) result = result.filter((a) => a.status === filter.status);
  if (filter?.customerRef) {
    const cref = filter.customerRef.trim();
    result = result.filter((a) => a.customerRef === cref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAccount);
}

export function clearCustomerAccounts(): void {
  accounts.clear();
}
