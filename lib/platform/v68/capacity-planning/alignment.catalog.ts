/**
 * V68 P5 — Capacity planning reference alignment (read-only)
 */
import { SERVICE_DEFINITION_CATALOG } from "../service-catalog/service.definition.catalog";

import { CAPACITY_BASELINE_CATALOG } from "./capacity.baseline.catalog";
import { RESOURCE_LIMIT_CATALOG } from "./resource.limit.catalog";
import { STRESS_RISK_CATALOG } from "./stress.risk.catalog";
import { THRESHOLD_DEFINITION_CATALOG } from "./threshold.definition.catalog";

export function isCapacityPlanningRefsAligned(): boolean {
  const serviceIds = new Set(SERVICE_DEFINITION_CATALOG.map((s) => s.id));
  const baselineIds = new Set(CAPACITY_BASELINE_CATALOG.map((b) => b.id));
  const thresholdIds = new Set(THRESHOLD_DEFINITION_CATALOG.map((t) => t.id));

  const baselinesAligned = CAPACITY_BASELINE_CATALOG.every((b) =>
    serviceIds.has(b.serviceDefRef),
  );
  const thresholdsAligned = THRESHOLD_DEFINITION_CATALOG.every((t) =>
    baselineIds.has(t.baselineRef),
  );
  const limitsAligned = RESOURCE_LIMIT_CATALOG.every((l) => serviceIds.has(l.serviceDefRef));
  const risksAligned = STRESS_RISK_CATALOG.every(
    (m) => serviceIds.has(m.serviceDefRef) && thresholdIds.has(m.thresholdRef),
  );

  const coverageComplete =
    SERVICE_DEFINITION_CATALOG.every((s) =>
      CAPACITY_BASELINE_CATALOG.some((b) => b.serviceDefRef === s.id),
    ) &&
    SERVICE_DEFINITION_CATALOG.every((s) =>
      RESOURCE_LIMIT_CATALOG.some((l) => l.serviceDefRef === s.id),
    ) &&
    SERVICE_DEFINITION_CATALOG.every((s) =>
      STRESS_RISK_CATALOG.some((m) => m.serviceDefRef === s.id),
    );

  return baselinesAligned && thresholdsAligned && limitsAligned && risksAligned && coverageComplete;
}

export function computeDeclarativeCapacityHeadroom(input: {
  baselineValue: number;
  currentValue: number;
  maxValue: number;
}): number {
  if (input.maxValue <= input.baselineValue) return 0;
  const range = input.maxValue - input.baselineValue;
  const used = Math.max(0, input.currentValue - input.baselineValue);
  return Math.max(0, Math.round(((range - used) / range) * 100));
}
