/**
 * V60 P4 — Procurement / Tender industry vertical
 */

import type { VerticalDefinition } from "../expansion.types";

export const PROCUREMENT_VERTICAL: VerticalDefinition = {
  id: "procurement",
  name: "Procurement / Tender Industry",
  description: "Government and enterprise procurement tender solutions",
  quoteTemplate: "enterprise_quote_v1",
  budgetTemplate: "cost_model_enterprise",
  tenderTemplate: "tender_enterprise_pro",
  modules: ["quote", "budget", "tender", "crm", "sales", "api_platform"],
};
