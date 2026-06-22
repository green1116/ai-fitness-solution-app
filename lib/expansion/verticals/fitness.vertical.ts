/**
 * V60 P4 — Fitness industry vertical (primary business)
 */

import type { VerticalDefinition } from "../expansion.types";

export const FITNESS_VERTICAL: VerticalDefinition = {
  id: "fitness",
  name: "Fitness Industry",
  description: "AI fitness solution quoting, budgeting, and tender generation",
  quoteTemplate: "fitness_quote_v1",
  budgetTemplate: "cost_model_fitness",
  tenderTemplate: "tender_standard_cn",
  modules: ["quote", "budget", "tender", "growth", "crm", "sales"],
};
