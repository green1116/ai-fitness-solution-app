/**
 * Product Marketplace — Lifecycle registry
 */

import { MARKETPLACE_LIFECYCLE_STATES } from "../management/management.constants";
import { getMarketplaceListing } from "../registry/listing.registry";
import { getMarketplaceVersion } from "../version/version.registry";
import type {
  MarketplaceLifecycle,
  MarketplaceLifecycleState,
  OpenMarketplaceLifecycleInput,
  TransitionMarketplaceLifecycleInput,
} from "./lifecycle.types";

const lifecycles = new Map<string, MarketplaceLifecycle>();

const ALLOWED: Record<
  MarketplaceLifecycleState,
  readonly MarketplaceLifecycleState[]
> = {
  DRAFT: ["PUBLISHED", "RETIRED"],
  PUBLISHED: ["DEPRECATED", "RETIRED"],
  DEPRECATED: ["RETIRED"],
  RETIRED: [],
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLifecycle(
  lifecycle: MarketplaceLifecycle,
): MarketplaceLifecycle {
  return { ...lifecycle, metadata: { ...lifecycle.metadata } };
}

export function openMarketplaceLifecycle(
  input: OpenMarketplaceLifecycleInput,
): MarketplaceLifecycle {
  const listingId = input.listingId.trim();
  const versionId = input.versionId.trim();
  if (!listingId) throw new Error("lifecycle.listingId is required");
  if (!versionId) throw new Error("lifecycle.versionId is required");
  if (!getMarketplaceListing(listingId)) {
    throw new Error(`listing not found: ${listingId}`);
  }
  const version = getMarketplaceVersion(versionId);
  if (!version) throw new Error(`version not found: ${versionId}`);
  if (version.listingId !== listingId) {
    throw new Error(`version listing mismatch: ${versionId}`);
  }

  const duplicate = [...lifecycles.values()].find(
    (l) => l.listingId === listingId && l.versionId === versionId,
  );
  if (duplicate) {
    throw new Error(`lifecycle already exists: ${versionId}`);
  }

  const id = input.id?.trim() || createId("mktlc");
  if (lifecycles.has(id)) throw new Error(`lifecycle already exists: ${id}`);

  const now = nowIso();
  const lifecycle: MarketplaceLifecycle = {
    id,
    listingId,
    versionId,
    state: MARKETPLACE_LIFECYCLE_STATES[0],
    detail: "state=DRAFT",
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  lifecycles.set(id, lifecycle);
  return cloneLifecycle(lifecycle);
}

export function transitionMarketplaceLifecycle(
  input: TransitionMarketplaceLifecycleInput,
): MarketplaceLifecycle {
  const lifecycleId = input.lifecycleId.trim();
  if (!lifecycleId) throw new Error("lifecycle.lifecycleId is required");
  if (
    !(MARKETPLACE_LIFECYCLE_STATES as readonly string[]).includes(input.state)
  ) {
    throw new Error(`invalid lifecycle state: ${input.state}`);
  }

  const existing = lifecycles.get(lifecycleId);
  if (!existing) throw new Error(`lifecycle not found: ${lifecycleId}`);

  const allowed = ALLOWED[existing.state];
  if (!allowed.includes(input.state)) {
    throw new Error(
      `invalid lifecycle transition: ${existing.state} -> ${input.state}`,
    );
  }

  const updated: MarketplaceLifecycle = {
    ...existing,
    state: input.state,
    detail: `state=${input.state}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  lifecycles.set(lifecycleId, updated);
  return cloneLifecycle(updated);
}

export function getMarketplaceLifecycle(
  id: string,
): MarketplaceLifecycle | undefined {
  const lifecycle = lifecycles.get(id.trim());
  return lifecycle ? cloneLifecycle(lifecycle) : undefined;
}

export function listMarketplaceLifecycles(filter?: {
  listingId?: string;
  state?: MarketplaceLifecycleState;
}): MarketplaceLifecycle[] {
  let result = [...lifecycles.values()];
  if (filter?.listingId) {
    const listingId = filter.listingId.trim();
    result = result.filter((l) => l.listingId === listingId);
  }
  if (filter?.state) result = result.filter((l) => l.state === filter.state);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneLifecycle);
}

export function clearMarketplaceLifecycles(): void {
  lifecycles.clear();
}
