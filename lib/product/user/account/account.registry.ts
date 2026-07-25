/**
 * Product User — Account registry
 */

import {
  USER_ACCOUNT_KINDS,
  USER_ACCOUNT_STATUSES,
} from "../administration/administration.constants";
import type {
  RegisterUserAccountInput,
  UpdateUserAccountStatusInput,
  UserAccount,
  UserAccountKind,
  UserAccountStatus,
} from "./account.types";

const accounts = new Map<string, UserAccount>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAccount(account: UserAccount): UserAccount {
  return { ...account, metadata: { ...account.metadata } };
}

export function registerUserAccount(
  input: RegisterUserAccountInput,
): UserAccount {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  const tenantRecordId = input.tenantRecordId.trim();
  if (!email) throw new Error("account.email is required");
  if (!displayName) throw new Error("account.displayName is required");
  if (!tenantRecordId) throw new Error("account.tenantRecordId is required");
  if (!(USER_ACCOUNT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid account kind: ${input.kind}`);
  }

  const duplicate = [...accounts.values()].find((a) => a.email === email);
  if (duplicate) throw new Error(`user email already exists: ${email}`);

  const id = input.id?.trim() || createId("usracc");
  if (accounts.has(id)) throw new Error(`user account already exists: ${id}`);

  const now = nowIso();
  const account: UserAccount = {
    id,
    email,
    displayName,
    kind: input.kind,
    tenantRecordId,
    status: USER_ACCOUNT_STATUSES[0],
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  accounts.set(id, account);
  return cloneAccount(account);
}

export function updateUserAccountStatus(
  input: UpdateUserAccountStatusInput,
): UserAccount {
  const accountId = input.accountId.trim();
  if (!accountId) throw new Error("account.accountId is required");
  if (!(USER_ACCOUNT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid account status: ${input.status}`);
  }

  const existing = accounts.get(accountId);
  if (!existing) throw new Error(`user account not found: ${accountId}`);

  const updated: UserAccount = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  accounts.set(accountId, updated);
  return cloneAccount(updated);
}

export function getUserAccount(id: string): UserAccount | undefined {
  const account = accounts.get(id.trim());
  return account ? cloneAccount(account) : undefined;
}

export function listUserAccounts(filter?: {
  kind?: UserAccountKind;
  status?: UserAccountStatus;
  tenantRecordId?: string;
}): UserAccount[] {
  let result = [...accounts.values()];
  if (filter?.kind) result = result.filter((a) => a.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((a) => a.status === filter.status);
  }
  if (filter?.tenantRecordId) {
    const tenantRecordId = filter.tenantRecordId.trim();
    result = result.filter((a) => a.tenantRecordId === tenantRecordId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAccount);
}

export function clearUserAccounts(): void {
  accounts.clear();
}
