/**
 * Product App — ownership registry (soft partner refs only)
 */

import { APP_OWNERSHIP_STATUSES } from "../management/management.constants";
import { getApp } from "../registry/app.registry";
import type {
  AppOwnership,
  AppOwnershipStatus,
  AssignAppOwnershipInput,
  UpdateAppOwnershipStatusInput,
} from "./ownership.types";

const ownerships = new Map<string, AppOwnership>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOwnership(ownership: AppOwnership): AppOwnership {
  return { ...ownership, metadata: { ...ownership.metadata } };
}

export function assignAppOwnership(
  input: AssignAppOwnershipInput,
): AppOwnership {
  const appId = input.appId.trim();
  const ownershipKey = input.ownershipKey.trim().toUpperCase();
  const partnerKeyRef = input.partnerKeyRef.trim().toUpperCase();
  if (!appId) throw new Error("ownership.appId is required");
  if (!ownershipKey) throw new Error("ownership.ownershipKey is required");
  if (!partnerKeyRef) throw new Error("ownership.partnerKeyRef is required");

  const app = getApp(appId);
  if (!app) throw new Error(`app not found: ${appId}`);
  if (app.status !== "ACTIVE") {
    throw new Error(`app not active: ${appId}`);
  }

  const duplicate = [...ownerships.values()].find(
    (o) => o.appId === appId && o.ownershipKey === ownershipKey,
  );
  if (duplicate) {
    throw new Error(`ownershipKey already exists: ${ownershipKey}`);
  }

  const id = input.id?.trim() || createId("appown");
  if (ownerships.has(id)) throw new Error(`ownership already exists: ${id}`);

  const now = nowIso();
  const ownership: AppOwnership = {
    id,
    appId,
    ownershipKey,
    partnerKeyRef,
    status: APP_OWNERSHIP_STATUSES[0],
    detail: `partner=${partnerKeyRef} status=ASSIGNED`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  ownerships.set(id, ownership);
  return cloneOwnership(ownership);
}

export function updateAppOwnershipStatus(
  input: UpdateAppOwnershipStatusInput,
): AppOwnership {
  const ownershipId = input.ownershipId.trim();
  if (!ownershipId) throw new Error("ownership.ownershipId is required");
  if (
    !(APP_OWNERSHIP_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid ownership status: ${input.status}`);
  }

  const existing = ownerships.get(ownershipId);
  if (!existing) throw new Error(`ownership not found: ${ownershipId}`);

  const updated: AppOwnership = {
    ...existing,
    status: input.status,
    detail: `partner=${existing.partnerKeyRef} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  ownerships.set(ownershipId, updated);
  return cloneOwnership(updated);
}

export function getAppOwnership(id: string): AppOwnership | undefined {
  const ownership = ownerships.get(id.trim());
  return ownership ? cloneOwnership(ownership) : undefined;
}

export function listAppOwnerships(filter?: {
  appId?: string;
  status?: AppOwnershipStatus;
}): AppOwnership[] {
  let result = [...ownerships.values()];
  if (filter?.appId) {
    const appId = filter.appId.trim();
    result = result.filter((o) => o.appId === appId);
  }
  if (filter?.status) {
    result = result.filter((o) => o.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.ownershipKey.localeCompare(b.ownershipKey))
    .map(cloneOwnership);
}

export function clearAppOwnerships(): void {
  ownerships.clear();
}
