/**
 * Product P6 — Cost model registry
 */

import { COST_MODEL_KINDS } from "../budget/budget.constants";
import { getBudget } from "../budget/budget.registry";
import type {
  CostModel,
  CostModelKind,
  CreateCostModelInput,
} from "./cost-model.types";

const costModels = new Map<string, CostModel>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCostModel(model: CostModel): CostModel {
  return { ...model, metadata: { ...model.metadata } };
}

export function createCostModel(input: CreateCostModelInput): CostModel {
  const budgetId = input.budgetId.trim();
  const name = input.name.trim();
  if (!budgetId) throw new Error("cost-model.budgetId is required");
  if (!name) throw new Error("cost-model.name is required");
  if (!(COST_MODEL_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid cost model kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.annualCost) || input.annualCost < 0) {
    throw new Error("cost-model.annualCost must be a non-negative number");
  }
  if (!getBudget(budgetId)) {
    throw new Error(`budget not found: ${budgetId}`);
  }

  const id = input.id?.trim() || createId("p6cst");
  if (costModels.has(id)) {
    throw new Error(`cost model already exists: ${id}`);
  }

  const model: CostModel = {
    id,
    budgetId,
    kind: input.kind,
    name,
    annualCost: input.annualCost,
    detail: `kind=${input.kind} annual=${input.annualCost}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  costModels.set(id, model);
  return cloneCostModel(model);
}

export function getCostModel(id: string): CostModel | undefined {
  const model = costModels.get(id.trim());
  return model ? cloneCostModel(model) : undefined;
}

export function listCostModels(filter?: {
  budgetId?: string;
  kind?: CostModelKind;
}): CostModel[] {
  let result = [...costModels.values()];
  if (filter?.budgetId) {
    const bid = filter.budgetId.trim();
    result = result.filter((m) => m.budgetId === bid);
  }
  if (filter?.kind) result = result.filter((m) => m.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCostModel);
}

export function clearCostModels(): void {
  costModels.clear();
}
