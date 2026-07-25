/**
 * Product User — Lifecycle registry
 */

import { USER_LIFECYCLE_STATES } from "../administration/administration.constants";
import { getUserAccount } from "../account/account.registry";
import type {
  CreateUserLifecycleInput,
  TransitionUserLifecycleInput,
  UserLifecycle,
  UserLifecycleState,
} from "./lifecycle.types";

const lifecycles = new Map<string, UserLifecycle>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLifecycle(lifecycle: UserLifecycle): UserLifecycle {
  return { ...lifecycle, metadata: { ...lifecycle.metadata } };
}

export function createUserLifecycle(
  input: CreateUserLifecycleInput,
): UserLifecycle {
  const accountId = input.accountId.trim();
  if (!accountId) throw new Error("lifecycle.accountId is required");
  const account = getUserAccount(accountId);
  if (!account) throw new Error(`user account not found: ${accountId}`);
  if (account.status !== "ACTIVE") {
    throw new Error(`user account not active: ${accountId}`);
  }

  const existing = [...lifecycles.values()].find(
    (l) => l.accountId === accountId,
  );
  if (existing) {
    throw new Error(`user lifecycle already exists: ${accountId}`);
  }

  const id = input.id?.trim() || createId("usrlc");
  if (lifecycles.has(id)) {
    throw new Error(`user lifecycle already exists: ${id}`);
  }

  const now = nowIso();
  const lifecycle: UserLifecycle = {
    id,
    accountId,
    state: USER_LIFECYCLE_STATES[0],
    detail: `state=INVITED`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  lifecycles.set(id, lifecycle);
  return cloneLifecycle(lifecycle);
}

export function transitionUserLifecycle(
  input: TransitionUserLifecycleInput,
): UserLifecycle {
  const lifecycleId = input.lifecycleId.trim();
  if (!lifecycleId) throw new Error("lifecycle.lifecycleId is required");
  if (!(USER_LIFECYCLE_STATES as readonly string[]).includes(input.state)) {
    throw new Error(`invalid lifecycle state: ${input.state}`);
  }

  const existing = lifecycles.get(lifecycleId);
  if (!existing) throw new Error(`user lifecycle not found: ${lifecycleId}`);

  const updated: UserLifecycle = {
    ...existing,
    state: input.state,
    detail: `state=${input.state}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  lifecycles.set(lifecycleId, updated);
  return cloneLifecycle(updated);
}

export function getUserLifecycle(id: string): UserLifecycle | undefined {
  const lifecycle = lifecycles.get(id.trim());
  return lifecycle ? cloneLifecycle(lifecycle) : undefined;
}

export function listUserLifecycles(filter?: {
  accountId?: string;
  state?: UserLifecycleState;
}): UserLifecycle[] {
  let result = [...lifecycles.values()];
  if (filter?.accountId) {
    const accountId = filter.accountId.trim();
    result = result.filter((l) => l.accountId === accountId);
  }
  if (filter?.state) result = result.filter((l) => l.state === filter.state);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneLifecycle);
}

export function clearUserLifecycles(): void {
  lifecycles.clear();
}
