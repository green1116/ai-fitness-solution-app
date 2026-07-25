/**
 * Product KPI — Target registry
 */

import { getKpiDefinition } from "../definition/definition.registry";
import { TARGET_PERIODS } from "../management/management.constants";
import type {
  KpiTarget,
  SetKpiTargetInput,
  TargetPeriod,
} from "./target.types";

const targets = new Map<string, KpiTarget>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTarget(target: KpiTarget): KpiTarget {
  return { ...target, metadata: { ...target.metadata } };
}

export function setKpiTarget(input: SetKpiTargetInput): KpiTarget {
  const kpiId = input.kpiId.trim();
  if (!kpiId) throw new Error("target.kpiId is required");
  if (!(TARGET_PERIODS as readonly string[]).includes(input.period)) {
    throw new Error(`invalid target period: ${input.period}`);
  }
  if (!Number.isFinite(input.value) || input.value < 0) {
    throw new Error("target.value must be a non-negative number");
  }
  if (!getKpiDefinition(kpiId)) {
    throw new Error(`kpi not found: ${kpiId}`);
  }

  const existing = [...targets.values()].find(
    (t) => t.kpiId === kpiId && t.period === input.period,
  );
  const id = input.id?.trim() || existing?.id || createId("kpitgt");
  if (targets.has(id) && existing && existing.id !== id) {
    throw new Error(`kpi target already exists: ${id}`);
  }

  const target: KpiTarget = {
    id,
    kpiId,
    period: input.period,
    value: input.value,
    detail: `period=${input.period} value=${input.value}`,
    metadata: { ...(input.metadata ?? existing?.metadata ?? {}) },
    setAt: nowIso(),
  };
  targets.set(id, target);
  return cloneTarget(target);
}

export function getKpiTarget(id: string): KpiTarget | undefined {
  const target = targets.get(id.trim());
  return target ? cloneTarget(target) : undefined;
}

export function listKpiTargets(filter?: {
  kpiId?: string;
  period?: TargetPeriod;
}): KpiTarget[] {
  let result = [...targets.values()];
  if (filter?.kpiId) {
    const kpiId = filter.kpiId.trim();
    result = result.filter((t) => t.kpiId === kpiId);
  }
  if (filter?.period) {
    result = result.filter((t) => t.period === filter.period);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTarget);
}

export function clearKpiTargets(): void {
  targets.clear();
}
