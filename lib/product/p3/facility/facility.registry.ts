/**
 * Product P3 — Facility registry
 */

import { FACILITY_KINDS } from "../project/project.constants";
import { getProject } from "../project/project.registry";
import { getSite } from "../site/site.registry";
import type {
  FacilityKind,
  ProjectFacility,
  RegisterFacilityInput,
} from "./facility.types";

const facilities = new Map<string, ProjectFacility>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneFacility(facility: ProjectFacility): ProjectFacility {
  return { ...facility, metadata: { ...facility.metadata } };
}

export function registerFacility(
  input: RegisterFacilityInput,
): ProjectFacility {
  const projectId = input.projectId.trim();
  const siteId = input.siteId.trim();
  const name = input.name.trim();
  if (!projectId) throw new Error("facility.projectId is required");
  if (!siteId) throw new Error("facility.siteId is required");
  if (!name) throw new Error("facility.name is required");
  if (!(FACILITY_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid facility kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.capacity) || input.capacity < 0) {
    throw new Error("facility.capacity must be a non-negative number");
  }
  if (!getProject(projectId)) {
    throw new Error(`project not found: ${projectId}`);
  }
  const site = getSite(siteId);
  if (!site || site.projectId !== projectId) {
    throw new Error(`site not found for project: ${siteId}`);
  }

  const id = input.id?.trim() || createId("p3fac");
  if (facilities.has(id)) {
    throw new Error(`facility already exists: ${id}`);
  }

  const capacity = Math.round(input.capacity);
  const facility: ProjectFacility = {
    id,
    projectId,
    siteId,
    name,
    kind: input.kind,
    capacity,
    detail: `kind=${input.kind} capacity=${capacity}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  facilities.set(id, facility);
  return cloneFacility(facility);
}

export function getFacility(id: string): ProjectFacility | undefined {
  const facility = facilities.get(id.trim());
  return facility ? cloneFacility(facility) : undefined;
}

export function listFacilities(filter?: {
  projectId?: string;
  siteId?: string;
  kind?: FacilityKind;
}): ProjectFacility[] {
  let result = [...facilities.values()];
  if (filter?.projectId) {
    const pid = filter.projectId.trim();
    result = result.filter((f) => f.projectId === pid);
  }
  if (filter?.siteId) {
    const sid = filter.siteId.trim();
    result = result.filter((f) => f.siteId === sid);
  }
  if (filter?.kind) result = result.filter((f) => f.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneFacility);
}

export function clearFacilities(): void {
  facilities.clear();
}
