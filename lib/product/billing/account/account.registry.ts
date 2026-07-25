/**
 * Product Billing — Account registry
 */

import { BILLING_ACCOUNT_STATUSES } from "../foundation/foundation.constants";
import type {
  BillingAccount,
  BillingAccountStatus,
  OpenBillingAccountInput,
  UpdateBillingAccountStatusInput,
} from "./account.types";

const accounts = new Map<string, BillingAccount>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAccount(account: BillingAccount): BillingAccount {
  return { ...account, metadata: { ...account.metadata } };
}

export function openBillingAccount(
  input: OpenBillingAccountInput,
): BillingAccount {
  const principalId = input.principalId.trim();
  const name = input.name.trim();
  const currency = (input.currency ?? "USD").trim().toUpperCase();
  if (!principalId) throw new Error("account.principalId is required");
  if (!name) throw new Error("account.name is required");
  if (!currency) throw new Error("account.currency is required");

  const id = input.id?.trim() || createId("bilacc");
  if (accounts.has(id)) throw new Error(`billing account already exists: ${id}`);

  const now = nowIso();
  const account: BillingAccount = {
    id,
    principalId,
    name,
    currency,
    status: BILLING_ACCOUNT_STATUSES[0],
    detail: `status=ACTIVE currency=${currency}`,
    metadata: { ...(input.metadata ?? {}) },
    openedAt: now,
    updatedAt: now,
  };
  accounts.set(id, account);
  return cloneAccount(account);
}

export function updateBillingAccountStatus(
  input: UpdateBillingAccountStatusInput,
): BillingAccount {
  const accountId = input.accountId.trim();
  if (!accountId) throw new Error("account.accountId is required");
  if (!(BILLING_ACCOUNT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid billing account status: ${input.status}`);
  }

  const existing = accounts.get(accountId);
  if (!existing) throw new Error(`billing account not found: ${accountId}`);

  const updated: BillingAccount = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} currency=${existing.currency}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  accounts.set(accountId, updated);
  return cloneAccount(updated);
}

export function getBillingAccount(id: string): BillingAccount | undefined {
  const account = accounts.get(id.trim());
  return account ? cloneAccount(account) : undefined;
}

export function listBillingAccounts(filter?: {
  principalId?: string;
  status?: BillingAccountStatus;
}): BillingAccount[] {
  let result = [...accounts.values()];
  if (filter?.principalId) {
    const pid = filter.principalId.trim();
    result = result.filter((a) => a.principalId === pid);
  }
  if (filter?.status) {
    result = result.filter((a) => a.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAccount);
}

export function clearBillingAccounts(): void {
  accounts.clear();
}
