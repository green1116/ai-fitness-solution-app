/**
 * Product User — Membership registry
 */

import {
  USER_MEMBERSHIP_ROLES,
  USER_MEMBERSHIP_STATUSES,
} from "../administration/administration.constants";
import { getUserAccount } from "../account/account.registry";
import type {
  BindUserMembershipInput,
  UpdateUserMembershipStatusInput,
  UserMembership,
  UserMembershipRole,
  UserMembershipStatus,
} from "./membership.types";

const memberships = new Map<string, UserMembership>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMembership(membership: UserMembership): UserMembership {
  return { ...membership, metadata: { ...membership.metadata } };
}

export function bindUserMembership(
  input: BindUserMembershipInput,
): UserMembership {
  const accountId = input.accountId.trim();
  const tenantRecordId = input.tenantRecordId.trim();
  if (!accountId) throw new Error("membership.accountId is required");
  if (!tenantRecordId) throw new Error("membership.tenantRecordId is required");
  if (!(USER_MEMBERSHIP_ROLES as readonly string[]).includes(input.role)) {
    throw new Error(`invalid membership role: ${input.role}`);
  }

  const account = getUserAccount(accountId);
  if (!account) throw new Error(`user account not found: ${accountId}`);
  if (account.tenantRecordId !== tenantRecordId) {
    throw new Error(`tenant mismatch: ${tenantRecordId}`);
  }

  const duplicate = [...memberships.values()].find(
    (m) =>
      m.accountId === accountId &&
      m.tenantRecordId === tenantRecordId &&
      m.status !== "REMOVED",
  );
  if (duplicate) {
    throw new Error(`membership already exists: ${accountId}`);
  }

  const id = input.id?.trim() || createId("usrmem");
  if (memberships.has(id)) {
    throw new Error(`membership already exists: ${id}`);
  }

  const now = nowIso();
  const membership: UserMembership = {
    id,
    accountId,
    tenantRecordId,
    role: input.role,
    status: USER_MEMBERSHIP_STATUSES[0],
    detail: `role=${input.role} status=INVITED`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  memberships.set(id, membership);
  return cloneMembership(membership);
}

export function updateUserMembershipStatus(
  input: UpdateUserMembershipStatusInput,
): UserMembership {
  const membershipId = input.membershipId.trim();
  if (!membershipId) throw new Error("membership.membershipId is required");
  if (
    !(USER_MEMBERSHIP_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid membership status: ${input.status}`);
  }

  const existing = memberships.get(membershipId);
  if (!existing) throw new Error(`membership not found: ${membershipId}`);

  const updated: UserMembership = {
    ...existing,
    status: input.status,
    detail: `role=${existing.role} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  memberships.set(membershipId, updated);
  return cloneMembership(updated);
}

export function getUserMembership(id: string): UserMembership | undefined {
  const membership = memberships.get(id.trim());
  return membership ? cloneMembership(membership) : undefined;
}

export function listUserMemberships(filter?: {
  accountId?: string;
  tenantRecordId?: string;
  role?: UserMembershipRole;
  status?: UserMembershipStatus;
}): UserMembership[] {
  let result = [...memberships.values()];
  if (filter?.accountId) {
    const accountId = filter.accountId.trim();
    result = result.filter((m) => m.accountId === accountId);
  }
  if (filter?.tenantRecordId) {
    const tenantRecordId = filter.tenantRecordId.trim();
    result = result.filter((m) => m.tenantRecordId === tenantRecordId);
  }
  if (filter?.role) result = result.filter((m) => m.role === filter.role);
  if (filter?.status) {
    result = result.filter((m) => m.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMembership);
}

export function clearUserMemberships(): void {
  memberships.clear();
}
