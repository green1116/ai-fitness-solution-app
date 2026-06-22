/**
 * V60 P4 — Enterprise services vertical
 */

import type { VerticalDefinition } from "../expansion.types";

export const ENTERPRISE_VERTICAL: VerticalDefinition = {
  id: "enterprise",
  name: "Enterprise Services",
  description: "Full-stack enterprise SaaS solution with API platform",
  quoteTemplate: "enterprise_quote_v1",
  budgetTemplate: "cost_model_enterprise",
  tenderTemplate: "tender_enterprise_pro",
  modules: ["quote", "budget", "tender", "growth", "crm", "sales", "api_platform", "white_label"],
};
