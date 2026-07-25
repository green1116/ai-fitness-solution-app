/**
 * Product P6 — Scenario registry
 */

import { SCENARIO_KINDS } from "../budget/budget.constants";
import { getBudget } from "../budget/budget.registry";
import type {
  BudgetScenario,
  CreateScenarioInput,
  ScenarioKind,
} from "./scenario.types";

const scenarios = new Map<string, BudgetScenario>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneScenario(scenario: BudgetScenario): BudgetScenario {
  return { ...scenario, metadata: { ...scenario.metadata } };
}

export function createScenario(input: CreateScenarioInput): BudgetScenario {
  const budgetId = input.budgetId.trim();
  const name = input.name.trim();
  if (!budgetId) throw new Error("scenario.budgetId is required");
  if (!name) throw new Error("scenario.name is required");
  if (!(SCENARIO_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid scenario kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.upliftPercent)) {
    throw new Error("scenario.upliftPercent must be a finite number");
  }
  if (!Number.isFinite(input.assumedReturn) || input.assumedReturn < 0) {
    throw new Error("scenario.assumedReturn must be a non-negative number");
  }
  if (!getBudget(budgetId)) {
    throw new Error(`budget not found: ${budgetId}`);
  }

  const id = input.id?.trim() || createId("p6scn");
  if (scenarios.has(id)) {
    throw new Error(`scenario already exists: ${id}`);
  }

  const scenario: BudgetScenario = {
    id,
    budgetId,
    kind: input.kind,
    name,
    upliftPercent: input.upliftPercent,
    assumedReturn: input.assumedReturn,
    detail: `kind=${input.kind} uplift=${input.upliftPercent}%`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  scenarios.set(id, scenario);
  return cloneScenario(scenario);
}

export function getScenario(id: string): BudgetScenario | undefined {
  const scenario = scenarios.get(id.trim());
  return scenario ? cloneScenario(scenario) : undefined;
}

export function listScenarios(filter?: {
  budgetId?: string;
  kind?: ScenarioKind;
}): BudgetScenario[] {
  let result = [...scenarios.values()];
  if (filter?.budgetId) {
    const bid = filter.budgetId.trim();
    result = result.filter((s) => s.budgetId === bid);
  }
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneScenario);
}

export function clearScenarios(): void {
  scenarios.clear();
}
