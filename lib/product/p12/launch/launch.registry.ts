/**
 * Product P12 — Launch registry
 */

import { LAUNCH_STATUSES } from "./launch.constants";
import type {
  CreateLaunchInput,
  LaunchStatus,
  ProductionLaunch,
  UpdateLaunchStatusInput,
} from "./launch.types";

const launches = new Map<string, ProductionLaunch>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLaunch(launch: ProductionLaunch): ProductionLaunch {
  return { ...launch, metadata: { ...launch.metadata } };
}

export function createLaunch(input: CreateLaunchInput): ProductionLaunch {
  const commercialReleaseRef = input.commercialReleaseRef.trim();
  const name = input.name.trim();
  const owner = input.owner.trim();
  if (!commercialReleaseRef) {
    throw new Error("launch.commercialReleaseRef is required");
  }
  if (!name) throw new Error("launch.name is required");
  if (!owner) throw new Error("launch.owner is required");

  const id = input.id?.trim() || createId("p12lch");
  if (launches.has(id)) {
    throw new Error(`launch already exists: ${id}`);
  }

  const now = nowIso();
  const status = LAUNCH_STATUSES[0];
  const launch: ProductionLaunch = {
    id,
    commercialReleaseRef,
    name,
    owner,
    status,
    detail: `status=${status} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  launches.set(id, launch);
  return cloneLaunch(launch);
}

export function updateLaunchStatus(
  input: UpdateLaunchStatusInput,
): ProductionLaunch {
  const launchId = input.launchId.trim();
  if (!launchId) throw new Error("launch.launchId is required");
  if (!(LAUNCH_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid launch status: ${input.status}`);
  }
  const existing = launches.get(launchId);
  if (!existing) throw new Error(`launch not found: ${launchId}`);

  const updated: ProductionLaunch = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} owner=${existing.owner}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  launches.set(launchId, updated);
  return cloneLaunch(updated);
}

export function getLaunch(id: string): ProductionLaunch | undefined {
  const launch = launches.get(id.trim());
  return launch ? cloneLaunch(launch) : undefined;
}

export function listLaunches(filter?: {
  commercialReleaseRef?: string;
  status?: LaunchStatus;
}): ProductionLaunch[] {
  let result = [...launches.values()];
  if (filter?.commercialReleaseRef) {
    const cref = filter.commercialReleaseRef.trim();
    result = result.filter((l) => l.commercialReleaseRef === cref);
  }
  if (filter?.status) result = result.filter((l) => l.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneLaunch);
}

export function clearLaunches(): void {
  launches.clear();
}
