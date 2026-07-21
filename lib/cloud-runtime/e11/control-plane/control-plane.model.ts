/**
 * E11-P7 — Control Plane Model
 * Registers control plane domains and scopes
 */

import {
  CONTROL_PLANE_SCOPES,
  CONTROL_PLANE_STATUSES,
} from "./control-plane.constants";
import type {
  ControlPlaneRecord,
  ControlPlaneScope,
  ControlPlaneStatus,
  RegisterControlPlaneInput,
} from "./control-plane.types";

const planes = new Map<string, ControlPlaneRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlane(plane: ControlPlaneRecord): ControlPlaneRecord {
  return { ...plane, metadata: { ...plane.metadata } };
}

export function registerControlPlane(
  input: RegisterControlPlaneInput,
): ControlPlaneRecord {
  const name = input.name.trim();
  if (!name) throw new Error("controlPlane.name is required");

  const scope = input.scope ?? "GLOBAL";
  if (!(CONTROL_PLANE_SCOPES as readonly string[]).includes(scope)) {
    throw new Error(`invalid control plane scope: ${scope}`);
  }

  const status = input.status ?? "ACTIVE";
  if (!(CONTROL_PLANE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid control plane status: ${status}`);
  }

  if (scope === "TENANT" && !input.tenantId?.trim()) {
    throw new Error("tenantId required for TENANT scope");
  }
  if (scope === "ORGANIZATION" && !input.organizationId?.trim()) {
    throw new Error("organizationId required for ORGANIZATION scope");
  }
  if (scope === "RUNTIME" && !input.runtimeId?.trim()) {
    throw new Error("runtimeId required for RUNTIME scope");
  }

  const id = input.id?.trim() || createId("cplane");
  if (planes.has(id)) throw new Error(`control plane already exists: ${id}`);

  const plane: ControlPlaneRecord = {
    id,
    name,
    scope,
    status,
    organizationId: input.organizationId?.trim() || undefined,
    tenantId: input.tenantId?.trim() || undefined,
    runtimeId: input.runtimeId?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  planes.set(id, plane);
  return clonePlane(plane);
}

export function getControlPlane(id: string): ControlPlaneRecord | undefined {
  const plane = planes.get(id.trim());
  return plane ? clonePlane(plane) : undefined;
}

export function listControlPlanes(filter?: {
  scope?: ControlPlaneScope;
  status?: ControlPlaneStatus;
  tenantId?: string;
  organizationId?: string;
}): ControlPlaneRecord[] {
  let result = [...planes.values()];
  if (filter?.scope) result = result.filter((p) => p.scope === filter.scope);
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((p) => p.tenantId === tid);
  }
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((p) => p.organizationId === oid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePlane);
}

export function setControlPlaneStatus(
  id: string,
  status: ControlPlaneStatus,
): ControlPlaneRecord {
  const plane = planes.get(id.trim());
  if (!plane) throw new Error(`control plane not found: ${id}`);
  if (!(CONTROL_PLANE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid control plane status: ${status}`);
  }
  plane.status = status;
  planes.set(plane.id, plane);
  return clonePlane(plane);
}

export function clearControlPlanes(): void {
  planes.clear();
}
