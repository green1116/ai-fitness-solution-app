/**
 * Product API Portal — portal registry
 */

import { PORTAL_STATUSES } from "../management/management.constants";
import type {
  PortalStatus,
  ProductPortal,
  RegisterPortalInput,
  UpdatePortalStatusInput,
} from "./portal.types";

const portals = new Map<string, ProductPortal>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePortal(portal: ProductPortal): ProductPortal {
  return { ...portal, metadata: { ...portal.metadata } };
}

export function registerPortal(input: RegisterPortalInput): ProductPortal {
  const portalKey = input.portalKey.trim().toUpperCase();
  const name = input.name.trim();
  const sdkClientKeyRef = input.sdkClientKeyRef.trim().toUpperCase();
  if (!portalKey) throw new Error("portal.portalKey is required");
  if (!name) throw new Error("portal.name is required");
  if (!sdkClientKeyRef) throw new Error("portal.sdkClientKeyRef is required");
  if (keys.has(portalKey)) {
    throw new Error(`portalKey already exists: ${portalKey}`);
  }

  const id = input.id?.trim() || createId("apiportal");
  if (portals.has(id)) throw new Error(`portal already exists: ${id}`);

  const now = nowIso();
  const portal: ProductPortal = {
    id,
    portalKey,
    name,
    status: PORTAL_STATUSES[0],
    sdkClientKeyRef,
    detail: `status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  portals.set(id, portal);
  keys.set(portalKey, id);
  return clonePortal(portal);
}

export function updatePortalStatus(
  input: UpdatePortalStatusInput,
): ProductPortal {
  const portalId = input.portalId.trim();
  if (!portalId) throw new Error("portal.portalId is required");
  if (!(PORTAL_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid portal status: ${input.status}`);
  }

  const existing = portals.get(portalId);
  if (!existing) throw new Error(`portal not found: ${portalId}`);

  const updated: ProductPortal = {
    ...existing,
    status: input.status,
    detail: `status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  portals.set(portalId, updated);
  return clonePortal(updated);
}

export function getPortal(id: string): ProductPortal | undefined {
  const portal = portals.get(id.trim());
  return portal ? clonePortal(portal) : undefined;
}

export function listPortals(filter?: {
  status?: PortalStatus;
}): ProductPortal[] {
  let result = [...portals.values()];
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.portalKey.localeCompare(b.portalKey))
    .map(clonePortal);
}

export function clearPortals(): void {
  portals.clear();
  keys.clear();
}
