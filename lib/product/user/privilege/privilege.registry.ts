/**
 * Product User — Privilege registry
 */

import { USER_PRIVILEGE_SCOPES } from "../administration/administration.constants";
import { getUserAccount } from "../account/account.registry";
import type {
  GrantUserPrivilegeInput,
  UserPrivilege,
  UserPrivilegeScope,
} from "./privilege.types";

const privileges = new Map<string, UserPrivilege>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePrivilege(privilege: UserPrivilege): UserPrivilege {
  return { ...privilege, metadata: { ...privilege.metadata } };
}

export function grantUserPrivilege(
  input: GrantUserPrivilegeInput,
): UserPrivilege {
  const accountId = input.accountId.trim();
  const code = input.code.trim().toUpperCase();
  if (!accountId) throw new Error("privilege.accountId is required");
  if (!code) throw new Error("privilege.code is required");
  if (!(USER_PRIVILEGE_SCOPES as readonly string[]).includes(input.scope)) {
    throw new Error(`invalid privilege scope: ${input.scope}`);
  }
  if (!getUserAccount(accountId)) {
    throw new Error(`user account not found: ${accountId}`);
  }

  const duplicate = [...privileges.values()].find(
    (p) =>
      p.accountId === accountId &&
      p.code === code &&
      p.scope === input.scope,
  );
  if (duplicate) {
    throw new Error(`privilege already exists: ${code}`);
  }

  const id = input.id?.trim() || createId("usrprv");
  if (privileges.has(id)) {
    throw new Error(`privilege already exists: ${id}`);
  }

  const privilege: UserPrivilege = {
    id,
    accountId,
    code,
    scope: input.scope,
    detail: `scope=${input.scope} code=${code}`,
    metadata: { ...(input.metadata ?? {}) },
    grantedAt: nowIso(),
  };
  privileges.set(id, privilege);
  return clonePrivilege(privilege);
}

export function getUserPrivilege(id: string): UserPrivilege | undefined {
  const privilege = privileges.get(id.trim());
  return privilege ? clonePrivilege(privilege) : undefined;
}

export function listUserPrivileges(filter?: {
  accountId?: string;
  scope?: UserPrivilegeScope;
}): UserPrivilege[] {
  let result = [...privileges.values()];
  if (filter?.accountId) {
    const accountId = filter.accountId.trim();
    result = result.filter((p) => p.accountId === accountId);
  }
  if (filter?.scope) result = result.filter((p) => p.scope === filter.scope);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePrivilege);
}

export function clearUserPrivileges(): void {
  privileges.clear();
}
