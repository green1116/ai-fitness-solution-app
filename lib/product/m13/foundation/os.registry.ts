/**
 * Product M13 — Operating surface in-memory registry
 */

import {
  OS_SURFACE_STATUSES,
  PRODUCT_OS_FOUNDATION_BASE,
} from "./os.constants";
import { validateOsSurfaceInput } from "./os.metadata";
import type {
  OsSurface,
  OsSurfaceKind,
  OsSurfaceStatus,
  RegisterOsSurfaceInput,
  UpdateOsSurfaceStatusInput,
} from "./os.types";

const surfaces = new Map<string, OsSurface>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSurface(surface: OsSurface): OsSurface {
  return { ...surface, metadata: { ...surface.metadata } };
}

export function registerOsSurface(input: RegisterOsSurfaceInput): OsSurface {
  const validation = validateOsSurfaceInput(input);
  if (!validation.ok) {
    const first = validation.issues[0];
    throw new Error(
      `invalid os surface: ${first?.field} ${first?.message}`,
    );
  }

  const surfaceKey = input.surfaceKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  const agentBaselineRef = (
    input.agentBaselineRef ?? PRODUCT_OS_FOUNDATION_BASE
  )
    .trim()
    .toLowerCase();

  if (keys.has(surfaceKey)) {
    throw new Error(`surfaceKey already exists: ${surfaceKey}`);
  }

  const id = input.id?.trim() || createId("ossurf");
  if (surfaces.has(id)) throw new Error(`surface already exists: ${id}`);

  const now = nowIso();
  const surface: OsSurface = {
    id,
    surfaceKey,
    kind: input.kind,
    status: OS_SURFACE_STATUSES[0],
    scope: input.scope,
    title,
    summary,
    agentBaselineRef,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  surfaces.set(id, surface);
  keys.set(surfaceKey, id);
  return cloneSurface(surface);
}

export function updateOsSurfaceStatus(
  input: UpdateOsSurfaceStatusInput,
): OsSurface {
  const surfaceId = input.surfaceId.trim();
  if (!surfaceId) throw new Error("surface.surfaceId is required");
  if (!(OS_SURFACE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid surface status: ${input.status}`);
  }

  const existing = surfaces.get(surfaceId);
  if (!existing) throw new Error(`surface not found: ${surfaceId}`);

  const updated: OsSurface = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  surfaces.set(surfaceId, updated);
  return cloneSurface(updated);
}

export function getOsSurface(id: string): OsSurface | undefined {
  const surface = surfaces.get(id.trim());
  return surface ? cloneSurface(surface) : undefined;
}

export function getOsSurfaceByKey(surfaceKey: string): OsSurface | undefined {
  const id = keys.get(surfaceKey.trim().toUpperCase());
  return id ? getOsSurface(id) : undefined;
}

export function listOsSurfaces(filter?: {
  kind?: OsSurfaceKind;
  status?: OsSurfaceStatus;
}): OsSurface[] {
  let result = [...surfaces.values()];
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.surfaceKey.localeCompare(b.surfaceKey))
    .map(cloneSurface);
}

export function clearOsSurfaces(): void {
  surfaces.clear();
  keys.clear();
}
