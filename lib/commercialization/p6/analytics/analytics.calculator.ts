/**
 * Commercialization P6 — Analytics calculator
 */

import { getAnalyticsSnapshot } from "./analytics.engine";
import type {
  AnalyticsCalculation,
  CalculateAnalyticsInput,
} from "./analytics.types";

const calculations = new Map<string, AnalyticsCalculation>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCalc(calc: AnalyticsCalculation): AnalyticsCalculation {
  return { ...calc, inputs: { ...calc.inputs } };
}

export function calculateAnalyticsMetric(
  input: CalculateAnalyticsInput,
): AnalyticsCalculation {
  const analyticsId = input.analyticsId.trim();
  const snapshot = getAnalyticsSnapshot(analyticsId);
  if (!snapshot) {
    throw new Error(`analytics snapshot not found: ${analyticsId}`);
  }

  let result = 0;
  let inputs: Record<string, number> = {};
  if (input.formula === "GROWTH") {
    inputs = { growthRate: snapshot.growthRate, total: snapshot.revenueTotal };
    result = snapshot.growthRate;
  } else if (input.formula === "CHURN_RISK") {
    inputs = { churnRiskIndex: snapshot.churnRiskIndex };
    result = snapshot.churnRiskIndex;
  } else if (input.formula === "EXPANSION") {
    inputs = { expansionIndex: snapshot.expansionIndex };
    result = snapshot.expansionIndex;
  } else {
    throw new Error(`invalid analytics formula: ${input.formula}`);
  }

  const id = input.id?.trim() || createId("acalc");
  if (calculations.has(id)) {
    throw new Error(`analytics calculation already exists: ${id}`);
  }

  const calc: AnalyticsCalculation = {
    id,
    analyticsId,
    formula: input.formula,
    inputs,
    result,
    detail: `formula=${input.formula} result=${result}`,
    calculatedAt: nowIso(),
  };
  calculations.set(id, calc);
  return cloneCalc(calc);
}

export function getAnalyticsCalculation(
  id: string,
): AnalyticsCalculation | undefined {
  const calc = calculations.get(id.trim());
  return calc ? cloneCalc(calc) : undefined;
}

export function listAnalyticsCalculations(filter?: {
  analyticsId?: string;
}): AnalyticsCalculation[] {
  let result = [...calculations.values()];
  if (filter?.analyticsId) {
    const aid = filter.analyticsId.trim();
    result = result.filter((c) => c.analyticsId === aid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCalc);
}

export function clearAnalyticsCalculations(): void {
  calculations.clear();
}
