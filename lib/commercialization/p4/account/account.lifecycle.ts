/**
 * Commercialization P4 — Account lifecycle
 */

import { ACCOUNT_STATUSES } from "../onboarding/onboarding.constants";
import {
  getCustomerAccount,
  setAccountStatus,
} from "./account.registry";
import type {
  AccountLifecycleRecord,
  AccountStatus,
  TransitionAccountInput,
} from "./account.types";

const lifecycles = new Map<string, AccountLifecycleRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRecord(
  record: AccountLifecycleRecord,
): AccountLifecycleRecord {
  return { ...record };
}

export function transitionAccount(
  input: TransitionAccountInput,
): AccountLifecycleRecord {
  const accountId = input.accountId.trim();
  const account = getCustomerAccount(accountId);
  if (!account) throw new Error(`account not found: ${accountId}`);

  const status = input.status;
  if (!(ACCOUNT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid account status: ${status}`);
  }

  const previousStatus = account.status;
  setAccountStatus(accountId, status);

  const id = input.id?.trim() || createId("alife");
  if (lifecycles.has(id)) {
    throw new Error(`account lifecycle record already exists: ${id}`);
  }

  const record: AccountLifecycleRecord = {
    id,
    accountId,
    status,
    previousStatus,
    reason:
      (input.reason ?? `transition ${previousStatus}→${status}`).trim(),
    transitionedAt: nowIso(),
  };
  lifecycles.set(id, record);
  return cloneRecord(record);
}

export function getAccountLifecycleRecord(
  id: string,
): AccountLifecycleRecord | undefined {
  const record = lifecycles.get(id.trim());
  return record ? cloneRecord(record) : undefined;
}

export function listAccountLifecycleRecords(filter?: {
  accountId?: string;
  status?: AccountStatus;
}): AccountLifecycleRecord[] {
  let result = [...lifecycles.values()];
  if (filter?.accountId) {
    const aid = filter.accountId.trim();
    result = result.filter((r) => r.accountId === aid);
  }
  if (filter?.status) result = result.filter((r) => r.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRecord);
}

export function clearAccountLifecycleRecords(): void {
  lifecycles.clear();
}
