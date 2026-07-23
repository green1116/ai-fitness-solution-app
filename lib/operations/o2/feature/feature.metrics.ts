/**
 * Operations O2 — Feature metrics
 */

import { listFeatureAdoptions } from "./feature.adoption";
import type {
  ComputeFeatureMetricsInput,
  FeatureMetrics,
} from "./feature.types";

const metrics = new Map<string, FeatureMetrics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMetrics(entry: FeatureMetrics): FeatureMetrics {
  return { ...entry };
}

export function computeFeatureMetrics(
  input: ComputeFeatureMetricsInput,
): FeatureMetrics {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("featureMetrics.accountRef is required");

  const adoptions = listFeatureAdoptions({ accountRef });
  if (adoptions.length < 1) {
    throw new Error(`no feature adoptions for account: ${accountRef}`);
  }

  const featureCount = adoptions.length;
  const powerCount = adoptions.filter((a) => a.level === "POWER").length;
  const activeCount = adoptions.filter(
    (a) => a.level === "ACTIVE" || a.level === "POWER",
  ).length;
  const adoptionRate = Math.round((activeCount / featureCount) * 100);

  const id = input.id?.trim() || createId("o2fmet");
  if (metrics.has(id)) {
    throw new Error(`feature metrics already exists: ${id}`);
  }

  const entry: FeatureMetrics = {
    id,
    accountRef,
    featureCount,
    powerCount,
    activeCount,
    adoptionRate,
    detail: `features=${featureCount} active=${activeCount} rate=${adoptionRate}`,
    computedAt: nowIso(),
  };
  metrics.set(id, entry);
  return cloneMetrics(entry);
}

export function getFeatureMetrics(id: string): FeatureMetrics | undefined {
  const entry = metrics.get(id.trim());
  return entry ? cloneMetrics(entry) : undefined;
}

export function listFeatureMetrics(filter?: {
  accountRef?: string;
}): FeatureMetrics[] {
  let result = [...metrics.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((m) => m.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMetrics);
}

export function clearFeatureMetrics(): void {
  metrics.clear();
}
