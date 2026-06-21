/**
 * V60 P4 — Budget template engine
 */

import type { BudgetTemplateId } from "../expansion.types";

export type BudgetTemplate = {
  id: BudgetTemplateId;
  name: string;
  tiers: ("low" | "mid" | "high")[];
  costCategories: string[];
};

export const BUDGET_TEMPLATES: Record<BudgetTemplateId, BudgetTemplate> = {
  cost_model_fitness: {
    id: "cost_model_fitness",
    name: "Fitness Cost Model",
    tiers: ["low", "mid", "high"],
    costCategories: ["equipment", "installation", "maintenance", "training"],
  },
  cost_model_enterprise: {
    id: "cost_model_enterprise",
    name: "Enterprise Cost Model",
    tiers: ["low", "mid", "high"],
    costCategories: ["capex", "opex", "services", "licensing", "support"],
  },
};

export function getBudgetTemplate(id: BudgetTemplateId): BudgetTemplate {
  const template = BUDGET_TEMPLATES[id];
  if (!template) throw new Error(`Budget template not found: ${id}`);
  return template;
}
