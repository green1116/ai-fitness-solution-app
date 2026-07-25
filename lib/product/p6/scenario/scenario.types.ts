/**
 * Product P6 — Scenario types
 */

import type { SCENARIO_KINDS } from "../budget/budget.constants";

export type ScenarioKind = (typeof SCENARIO_KINDS)[number];
export type ScenarioMetadata = Record<string, unknown>;

export type BudgetScenario = {
  id: string;
  budgetId: string;
  kind: ScenarioKind;
  name: string;
  upliftPercent: number;
  assumedReturn: number;
  detail: string;
  metadata: ScenarioMetadata;
  createdAt: string;
};

export type CreateScenarioInput = {
  id?: string;
  budgetId: string;
  kind: ScenarioKind;
  name: string;
  upliftPercent: number;
  assumedReturn: number;
  metadata?: ScenarioMetadata;
};
