/**
 * Product P12 — Adoption registry
 */

import { ADOPTION_LEVELS } from "../launch/launch.constants";
import { getLaunch } from "../launch/launch.registry";
import type {
  AdoptionLevel,
  LaunchAdoption,
  RecordAdoptionInput,
} from "./adoption.types";

const adoptions = new Map<string, LaunchAdoption>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAdoption(adoption: LaunchAdoption): LaunchAdoption {
  return { ...adoption, metadata: { ...adoption.metadata } };
}

export function recordAdoption(input: RecordAdoptionInput): LaunchAdoption {
  const launchId = input.launchId.trim();
  const segment = input.segment.trim();
  if (!launchId) throw new Error("adoption.launchId is required");
  if (!segment) throw new Error("adoption.segment is required");
  if (!(ADOPTION_LEVELS as readonly string[]).includes(input.level)) {
    throw new Error(`invalid adoption level: ${input.level}`);
  }
  if (!Number.isFinite(input.activeUsers) || input.activeUsers < 0) {
    throw new Error("adoption.activeUsers must be a non-negative number");
  }
  if (!getLaunch(launchId)) {
    throw new Error(`launch not found: ${launchId}`);
  }

  const id = input.id?.trim() || createId("p12ado");
  if (adoptions.has(id)) {
    throw new Error(`adoption already exists: ${id}`);
  }

  const adoption: LaunchAdoption = {
    id,
    launchId,
    segment,
    level: input.level,
    activeUsers: input.activeUsers,
    detail: `level=${input.level} users=${input.activeUsers}`,
    metadata: { ...(input.metadata ?? {}) },
    measuredAt: nowIso(),
  };
  adoptions.set(id, adoption);
  return cloneAdoption(adoption);
}

export function getAdoption(id: string): LaunchAdoption | undefined {
  const adoption = adoptions.get(id.trim());
  return adoption ? cloneAdoption(adoption) : undefined;
}

export function listAdoptions(filter?: {
  launchId?: string;
  level?: AdoptionLevel;
}): LaunchAdoption[] {
  let result = [...adoptions.values()];
  if (filter?.launchId) {
    const lid = filter.launchId.trim();
    result = result.filter((a) => a.launchId === lid);
  }
  if (filter?.level) result = result.filter((a) => a.level === filter.level);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAdoption);
}

export function clearAdoptions(): void {
  adoptions.clear();
}
