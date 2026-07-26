/**
 * Product API Portal — surface registry (no UI runtime)
 */

import { PORTAL_SURFACE_KINDS } from "../management/management.constants";
import { getPortal } from "../registry/portal.registry";
import type {
  PortalSurface,
  PortalSurfaceKind,
  RegisterPortalSurfaceInput,
} from "./surface.types";

const surfaces = new Map<string, PortalSurface>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) return `/${trimmed}`;
  return trimmed.replace(/\/+$/, "") || "/";
}

function cloneSurface(surface: PortalSurface): PortalSurface {
  return { ...surface, metadata: { ...surface.metadata } };
}

export function registerPortalSurface(
  input: RegisterPortalSurfaceInput,
): PortalSurface {
  const portalId = input.portalId.trim();
  const surfaceKey = input.surfaceKey.trim().toUpperCase();
  const title = input.title.trim();
  const path = normalizePath(input.path);
  if (!portalId) throw new Error("surface.portalId is required");
  if (!surfaceKey) throw new Error("surface.surfaceKey is required");
  if (!title) throw new Error("surface.title is required");
  if (!(PORTAL_SURFACE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid surface kind: ${input.kind}`);
  }

  const portal = getPortal(portalId);
  if (!portal) throw new Error(`portal not found: ${portalId}`);
  if (portal.status !== "ACTIVE") {
    throw new Error(`portal not active: ${portalId}`);
  }

  const duplicateKey = [...surfaces.values()].find(
    (s) => s.portalId === portalId && s.surfaceKey === surfaceKey,
  );
  if (duplicateKey) {
    throw new Error(`surfaceKey already exists: ${surfaceKey}`);
  }

  const duplicatePath = [...surfaces.values()].find(
    (s) => s.portalId === portalId && s.path === path,
  );
  if (duplicatePath) throw new Error(`surface path already exists: ${path}`);

  const id = input.id?.trim() || createId("apiportalsurf");
  if (surfaces.has(id)) throw new Error(`surface already exists: ${id}`);

  const surface: PortalSurface = {
    id,
    portalId,
    surfaceKey,
    kind: input.kind,
    path,
    title,
    detail: `kind=${input.kind} path=${path}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  surfaces.set(id, surface);
  return cloneSurface(surface);
}

export function getPortalSurface(id: string): PortalSurface | undefined {
  const surface = surfaces.get(id.trim());
  return surface ? cloneSurface(surface) : undefined;
}

export function listPortalSurfaces(filter?: {
  portalId?: string;
  kind?: PortalSurfaceKind;
}): PortalSurface[] {
  let result = [...surfaces.values()];
  if (filter?.portalId) {
    const portalId = filter.portalId.trim();
    result = result.filter((s) => s.portalId === portalId);
  }
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.surfaceKey.localeCompare(b.surfaceKey))
    .map(cloneSurface);
}

export function clearPortalSurfaces(): void {
  surfaces.clear();
}
