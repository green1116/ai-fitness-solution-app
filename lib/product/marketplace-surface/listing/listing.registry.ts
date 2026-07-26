/**
 * Product Marketplace Surface — listing registry (no install / runtime)
 */

import { SURFACE_LISTING_STATUSES } from "../management/management.constants";
import { getSurfaceCatalog } from "../catalog/catalog.registry";
import type {
  MarketplaceSurfaceListing,
  RegisterSurfaceListingInput,
  SurfaceListingStatus,
  UpdateSurfaceListingStatusInput,
} from "./listing.types";

const listings = new Map<string, MarketplaceSurfaceListing>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneListing(
  listing: MarketplaceSurfaceListing,
): MarketplaceSurfaceListing {
  return { ...listing, metadata: { ...listing.metadata } };
}

export function registerSurfaceListing(
  input: RegisterSurfaceListingInput,
): MarketplaceSurfaceListing {
  const catalogId = input.catalogId.trim();
  const listingKey = input.listingKey.trim().toUpperCase();
  const title = input.title.trim();
  const appKeyRef = input.appKeyRef.trim().toUpperCase();
  if (!catalogId) throw new Error("listing.catalogId is required");
  if (!listingKey) throw new Error("listing.listingKey is required");
  if (!title) throw new Error("listing.title is required");
  if (!appKeyRef) throw new Error("listing.appKeyRef is required");

  const catalog = getSurfaceCatalog(catalogId);
  if (!catalog) throw new Error(`catalog not found: ${catalogId}`);
  if (catalog.status === "RETIRED") {
    throw new Error(`catalog retired: ${catalogId}`);
  }

  const duplicate = [...listings.values()].find(
    (l) => l.catalogId === catalogId && l.listingKey === listingKey,
  );
  if (duplicate) {
    throw new Error(`listingKey already exists: ${listingKey}`);
  }

  const id = input.id?.trim() || createId("surflisting");
  if (listings.has(id)) throw new Error(`listing already exists: ${id}`);

  const now = nowIso();
  const listing: MarketplaceSurfaceListing = {
    id,
    catalogId,
    listingKey,
    title,
    appKeyRef,
    status: SURFACE_LISTING_STATUSES[0],
    detail: `app=${appKeyRef} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  listings.set(id, listing);
  return cloneListing(listing);
}

export function updateSurfaceListingStatus(
  input: UpdateSurfaceListingStatusInput,
): MarketplaceSurfaceListing {
  const listingId = input.listingId.trim();
  if (!listingId) throw new Error("listing.listingId is required");
  if (
    !(SURFACE_LISTING_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid listing status: ${input.status}`);
  }

  const existing = listings.get(listingId);
  if (!existing) throw new Error(`listing not found: ${listingId}`);

  const updated: MarketplaceSurfaceListing = {
    ...existing,
    status: input.status,
    detail: `app=${existing.appKeyRef} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  listings.set(listingId, updated);
  return cloneListing(updated);
}

export function getSurfaceListing(
  id: string,
): MarketplaceSurfaceListing | undefined {
  const listing = listings.get(id.trim());
  return listing ? cloneListing(listing) : undefined;
}

export function listSurfaceListings(filter?: {
  catalogId?: string;
  status?: SurfaceListingStatus;
}): MarketplaceSurfaceListing[] {
  let result = [...listings.values()];
  if (filter?.catalogId) {
    const catalogId = filter.catalogId.trim();
    result = result.filter((l) => l.catalogId === catalogId);
  }
  if (filter?.status) {
    result = result.filter((l) => l.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.listingKey.localeCompare(b.listingKey))
    .map(cloneListing);
}

export function clearSurfaceListings(): void {
  listings.clear();
}
