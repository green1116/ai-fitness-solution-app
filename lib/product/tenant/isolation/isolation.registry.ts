/**
 * Product Tenant — Isolation registry
 */

import { TENANT_ISOLATION_MODES } from "../administration/administration.constants";
import { getTenantRecord } from "../record/record.registry";
import type {
  ConfigureTenantIsolationInput,
  TenantIsolation,
  TenantIsolationMode,
} from "./isolation.types";

const isolations = new Map<string, TenantIsolation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIsolation(isolation: TenantIsolation): TenantIsolation {
  return { ...isolation, metadata: { ...isolation.metadata } };
}

export function configureTenantIsolation(
  input: ConfigureTenantIsolationInput,
): TenantIsolation {
  const recordId = input.recordId.trim();
  const region = input.region.trim().toUpperCase();
  if (!recordId) throw new Error("isolation.recordId is required");
  if (!region) throw new Error("isolation.region is required");
  if (!(TENANT_ISOLATION_MODES as readonly string[]).includes(input.mode)) {
    throw new Error(`invalid isolation mode: ${input.mode}`);
  }
  if (!getTenantRecord(recordId)) {
    throw new Error(`tenant record not found: ${recordId}`);
  }

  const existing = [...isolations.values()].find(
    (i) => i.recordId === recordId,
  );
  const id = input.id?.trim() || existing?.id || createId("tntiso");
  if (isolations.has(id) && existing && existing.id !== id) {
    throw new Error(`tenant isolation already exists: ${id}`);
  }

  const isolation: TenantIsolation = {
    id,
    recordId,
    mode: input.mode,
    region,
    detail: `mode=${input.mode} region=${region}`,
    metadata: { ...(input.metadata ?? existing?.metadata ?? {}) },
    configuredAt: nowIso(),
  };
  isolations.set(id, isolation);
  return cloneIsolation(isolation);
}

export function getTenantIsolation(id: string): TenantIsolation | undefined {
  const isolation = isolations.get(id.trim());
  return isolation ? cloneIsolation(isolation) : undefined;
}

export function listTenantIsolations(filter?: {
  recordId?: string;
  mode?: TenantIsolationMode;
}): TenantIsolation[] {
  let result = [...isolations.values()];
  if (filter?.recordId) {
    const recordId = filter.recordId.trim();
    result = result.filter((i) => i.recordId === recordId);
  }
  if (filter?.mode) result = result.filter((i) => i.mode === filter.mode);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneIsolation);
}

export function clearTenantIsolations(): void {
  isolations.clear();
}
