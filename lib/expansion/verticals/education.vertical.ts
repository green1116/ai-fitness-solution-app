/**
 * V60 P4 — Education industry vertical
 */

import type { VerticalDefinition } from "../expansion.types";

export const EDUCATION_VERTICAL: VerticalDefinition = {
  id: "education",
  name: "Education Industry",
  description: "Campus fitness and wellness program proposals",
  quoteTemplate: "education_quote_v1",
  budgetTemplate: "cost_model_enterprise",
  tenderTemplate: "tender_standard_cn",
  modules: ["quote", "budget", "crm", "sales"],
};
