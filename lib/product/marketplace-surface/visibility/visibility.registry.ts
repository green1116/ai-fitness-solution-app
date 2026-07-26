/**
 * Product Marketplace Surface — visibility registry
 */

import { SURFACE_VISIBILITY_MODES } from "../management/management.constants";
import { getSurfaceCatalog } from "../catalog/catalog.registry";
import { getSurfaceListing } from "../listing/listing.registry";
import type {
  AttachSurfaceVisibilityInput,
  MarketplaceSurfaceVisibility,
  SurfaceVisibilityMode,
} from "./visibility.types";

const visibilities = new Map<string, MarketplaceSurfaceVisibility>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneVisibility(
  visibility: MarketplaceSurfaceVisibility,
): MarketplaceSurfaceVisibility {
  return { ...visibility, metadata: { ...visibility.metadata } };
}

export function attachSurfaceVisibility(
  input: AttachSurfaceVisibilityInput,
): MarketplaceSurfaceVisibility {
  const catalogId = input.catalogId.trim();
  const listingId = input.listingId.trim();
  const visibilityKey = input.visibilityKey.trim().toUpperCase();
  if (!catalogId) throw new Error("visibility.catalogId is required");
  if (!listingId) throw new Error("visibility.listingId is required");
  if (!visibilityKey) throw new Error("visibility.visibilityKey is required");
  if (!(SURFACE_VISIBILITY_MODES as readonly string[]).includes(input.mode)) {
    throw new Error(`invalid visibility mode: ${input.mode}`);
  }

  const catalog = getSurfaceCatalog(catalogId);
  if (!catalog) throw new Error(`catalog not found: ${catalogId}`);
  if (catalog.status !== "ACTIVE") {
    throw new Error(`catalog not active: ${catalogId}`);
  }

  const listing = getSurfaceListing(listingId);
  if (!listing) throw new Error(`listing not found: ${listingId}`);
  if (listing.catalogId !== catalogId) {
    throw new Error(`listing catalog mismatch: ${listingId}`);
  }
  if (listing.status !== "VISIBLE") {
    throw new Error(`listing not visible: ${listingId}`);
  }

  const duplicate = [...visibilities.values()].find(
    (v) => v.listingId === listingId && v.visibilityKey === visibilityKey,
  );
  if (duplicate) {
    throw new Error(`visibilityKey already exists: ${visibilityKey}`);
  }

  const id = input.id?.trim() || createId("surfvis");
  if (visibilities.has(id)) {
    throw new Error(`visibility already exists: ${id}`);
  }

  const visibility: MarketplaceSurfaceVisibility = {
    id,
    catalogId,
    listingId,
    visibilityKey,
    mode: input.mode,
    detail: `mode=${input.mode}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  visibilities.set(id, visibility);
  return cloneVisibility(visibility);
}

export function getSurfaceVisibility(
  id: string,
): MarketplaceSurfaceVisibility | undefined {
  const visibility = visibilities.get(id.trim());
  return visibility ? cloneVisibility(visibility) : undefined;
}

export function listSurfaceVisibilities(filter?: {
  catalogId?: string;
  listingId?: string;
  mode?: SurfaceVisibilityMode;
}): MarketplaceSurfaceVisibility[] {
  let result = [...visibilities.values()];
  if (filter?.catalogId) {
    const catalogId = filter.catalogId.trim();
    result = result.filter((v) => v.catalogId === catalogId);
  }
  if (filter?.listingId) {
    const listingId = filter.listingId.trim();
    result = result.filter((v) => v.listingId === listingId);
  }
  if (filter?.mode) {
    result = result.filter((v) => v.mode === filter.mode);
  }
  return result
    .slice()
    .sort((a, b) => a.visibilityKey.localeCompare(b.visibilityKey))
    .map(cloneVisibility);
}

export function clearSurfaceVisibilities(): void {
  visibilities.clear();
}
