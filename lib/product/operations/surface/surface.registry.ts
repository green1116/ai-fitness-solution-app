/**
 * Product Operations — Surface registry
 */

import {
  OPS_CONSOLE_KINDS,
  OPS_CONSOLE_STATUSES,
} from "../console/console.constants";
import type {
  OpsConsoleKind,
  OpsConsoleStatus,
  OpsSurface,
  RegisterOpsSurfaceInput,
  UpdateOpsSurfaceStatusInput,
} from "./surface.types";

const surfaces = new Map<string, OpsSurface>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSurface(surface: OpsSurface): OpsSurface {
  return { ...surface, metadata: { ...surface.metadata } };
}

export function registerOpsSurface(
  input: RegisterOpsSurfaceInput,
): OpsSurface {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  const configReleaseId = input.configReleaseId.trim();
  if (!code) throw new Error("surface.code is required");
  if (!name) throw new Error("surface.name is required");
  if (!configReleaseId) throw new Error("surface.configReleaseId is required");
  if (!(OPS_CONSOLE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid console kind: ${input.kind}`);
  }

  const duplicate = [...surfaces.values()].find((s) => s.code === code);
  if (duplicate) throw new Error(`surface code already exists: ${code}`);

  const id = input.id?.trim() || createId("opssfc");
  if (surfaces.has(id)) throw new Error(`surface already exists: ${id}`);

  const now = nowIso();
  const surface: OpsSurface = {
    id,
    code,
    name,
    kind: input.kind,
    configReleaseId,
    status: OPS_CONSOLE_STATUSES[0],
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  surfaces.set(id, surface);
  return cloneSurface(surface);
}

export function updateOpsSurfaceStatus(
  input: UpdateOpsSurfaceStatusInput,
): OpsSurface {
  const surfaceId = input.surfaceId.trim();
  if (!surfaceId) throw new Error("surface.surfaceId is required");
  if (!(OPS_CONSOLE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid surface status: ${input.status}`);
  }

  const existing = surfaces.get(surfaceId);
  if (!existing) throw new Error(`surface not found: ${surfaceId}`);

  const updated: OpsSurface = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  surfaces.set(surfaceId, updated);
  return cloneSurface(updated);
}

export function getOpsSurface(id: string): OpsSurface | undefined {
  const surface = surfaces.get(id.trim());
  return surface ? cloneSurface(surface) : undefined;
}

export function listOpsSurfaces(filter?: {
  kind?: OpsConsoleKind;
  status?: OpsConsoleStatus;
}): OpsSurface[] {
  let result = [...surfaces.values()];
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSurface);
}

export function clearOpsSurfaces(): void {
  surfaces.clear();
}
