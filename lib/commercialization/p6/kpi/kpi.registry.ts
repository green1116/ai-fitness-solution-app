/**
 * Commercialization P6 — KPI registry
 */

import { KPI_CATEGORIES } from "./kpi.constants";
import type {
  KpiCategory,
  RegisterKpiInput,
  RevenueKpi,
} from "./kpi.types";

const kpis = new Map<string, RevenueKpi>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneKpi(kpi: RevenueKpi): RevenueKpi {
  return { ...kpi };
}

export function registerKpi(input: RegisterKpiInput): RevenueKpi {
  const name = input.name.trim();
  if (!name) throw new Error("kpi.name is required");
  if (!(KPI_CATEGORIES as readonly string[]).includes(input.category)) {
    throw new Error(`invalid kpi category: ${input.category}`);
  }
  if (!Number.isFinite(input.target) || input.target <= 0) {
    throw new Error("kpi.target must be a positive number");
  }
  if (!Number.isFinite(input.actual) || input.actual < 0) {
    throw new Error("kpi.actual must be a non-negative number");
  }

  const attainment = Math.round((input.actual / input.target) * 100);
  const id = input.id?.trim() || createId("kpi");
  if (kpis.has(id)) {
    throw new Error(`kpi already exists: ${id}`);
  }

  const now = nowIso();
  const kpi: RevenueKpi = {
    id,
    name,
    category: input.category,
    target: Math.round(input.target),
    actual: Math.round(input.actual),
    unit: (input.unit ?? "USD").trim() || "USD",
    attainment,
    detail: `category=${input.category} attainment=${attainment}%`,
    createdAt: now,
    updatedAt: now,
  };
  kpis.set(id, kpi);
  return cloneKpi(kpi);
}

export function getRevenueKpi(id: string): RevenueKpi | undefined {
  const kpi = kpis.get(id.trim());
  return kpi ? cloneKpi(kpi) : undefined;
}

export function listRevenueKpis(filter?: {
  category?: KpiCategory;
}): RevenueKpi[] {
  let result = [...kpis.values()];
  if (filter?.category) {
    result = result.filter((k) => k.category === filter.category);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneKpi);
}

export function clearRevenueKpis(): void {
  kpis.clear();
}
