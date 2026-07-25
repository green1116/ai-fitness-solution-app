/**
 * Product KPI — Definition registry
 */

import {
  KPI_CATEGORIES,
  KPI_STATUSES,
} from "../management/management.constants";
import type {
  DefineKpiInput,
  KpiCategory,
  KpiDefinition,
  KpiStatus,
  UpdateKpiStatusInput,
} from "./definition.types";

const definitions = new Map<string, KpiDefinition>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDefinition(definition: KpiDefinition): KpiDefinition {
  return { ...definition, metadata: { ...definition.metadata } };
}

export function defineKpi(input: DefineKpiInput): KpiDefinition {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  const metricId = input.metricId.trim();
  if (!code) throw new Error("kpi.code is required");
  if (!name) throw new Error("kpi.name is required");
  if (!metricId) throw new Error("kpi.metricId is required");
  if (!(KPI_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new Error(`invalid kpi category: ${input.category}`);
  }

  const duplicate = [...definitions.values()].find((d) => d.code === code);
  if (duplicate) throw new Error(`kpi code already exists: ${code}`);

  const id = input.id?.trim() || createId("kpidef");
  if (definitions.has(id)) throw new Error(`kpi already exists: ${id}`);

  const now = nowIso();
  const definition: KpiDefinition = {
    id,
    code,
    name,
    category: input.category,
    metricId,
    status: KPI_STATUSES[0],
    detail: `category=${input.category} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  definitions.set(id, definition);
  return cloneDefinition(definition);
}

export function updateKpiStatus(input: UpdateKpiStatusInput): KpiDefinition {
  const kpiId = input.kpiId.trim();
  if (!kpiId) throw new Error("kpi.kpiId is required");
  if (!(KPI_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid kpi status: ${input.status}`);
  }

  const existing = definitions.get(kpiId);
  if (!existing) throw new Error(`kpi not found: ${kpiId}`);

  const updated: KpiDefinition = {
    ...existing,
    status: input.status,
    detail: `category=${existing.category} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  definitions.set(kpiId, updated);
  return cloneDefinition(updated);
}

export function getKpiDefinition(id: string): KpiDefinition | undefined {
  const definition = definitions.get(id.trim());
  return definition ? cloneDefinition(definition) : undefined;
}

export function listKpiDefinitions(filter?: {
  category?: KpiCategory;
  status?: KpiStatus;
}): KpiDefinition[] {
  let result = [...definitions.values()];
  if (filter?.category) {
    result = result.filter((d) => d.category === filter.category);
  }
  if (filter?.status) {
    result = result.filter((d) => d.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDefinition);
}

export function clearKpiDefinitions(): void {
  definitions.clear();
}
