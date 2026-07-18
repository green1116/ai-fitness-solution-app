/**
 * E09-P2 — Regional Hub
 * Hubs aggregate regions from the regional foundation
 */

import type { GlobalNodeMetadata } from "../core/global.types";
import type { Region } from "./regional.types";

export type RegionalHub = {
  id: string;
  name: string;
  regionIds: string[];
  metadata: GlobalNodeMetadata;
  createdAt: string;
};

export type CreateRegionalHubInput = {
  id: string;
  name: string;
  metadata?: GlobalNodeMetadata;
};

const hubs = new Map<string, RegionalHub>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneHub(hub: RegionalHub): RegionalHub {
  return {
    ...hub,
    regionIds: [...hub.regionIds],
    metadata: { ...hub.metadata },
  };
}

/** Create a regional hub shell (no regions attached yet). */
export function createHub(input: CreateRegionalHubInput): RegionalHub {
  const id = input.id.trim();
  const name = input.name.trim();
  if (!id) throw new Error("hub.id is required");
  if (!name) throw new Error("hub.name is required");
  if (hubs.has(id)) {
    throw new Error(`hub already exists: ${id}`);
  }

  const hub: RegionalHub = {
    id,
    name,
    regionIds: [],
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  hubs.set(id, hub);
  return cloneHub(hub);
}

/** Attach a Region to a hub (by region id, de-duplicated). */
export function attachRegion(hubId: string, region: Region): RegionalHub {
  const hub = hubs.get(hubId.trim());
  if (!hub) throw new Error(`hub not found: ${hubId}`);
  if (!region.id.trim()) throw new Error("region.id is required");

  if (!hub.regionIds.includes(region.id)) {
    hub.regionIds = [...hub.regionIds, region.id];
  }

  hubs.set(hub.id, hub);
  return cloneHub(hub);
}

export function getHub(id: string): RegionalHub | undefined {
  const hub = hubs.get(id.trim());
  return hub ? cloneHub(hub) : undefined;
}

/** Detach and remove a hub (drops all region attachments). */
export function detachHub(id: string): boolean {
  return hubs.delete(id.trim());
}

export function listHubs(): RegionalHub[] {
  return [...hubs.values()].map(cloneHub);
}

export function clearHubs(): void {
  hubs.clear();
}
