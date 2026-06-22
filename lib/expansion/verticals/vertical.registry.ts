/**
 * V60 P4 — Vertical industry registry
 */

import type { IndustryTemplateBundle, VerticalDefinition, VerticalIndustry } from "../expansion.types";
import { FITNESS_VERTICAL } from "./fitness.vertical";
import { EDUCATION_VERTICAL } from "./education.vertical";
import { PROCUREMENT_VERTICAL } from "./procurement.vertical";
import { ENTERPRISE_VERTICAL } from "./enterprise.vertical";

const HR_ADMIN_VERTICAL: VerticalDefinition = {
  id: "hr_admin",
  name: "HR / Admin Systems",
  description: "Workplace wellness and admin procurement workflows",
  quoteTemplate: "enterprise_quote_v1",
  budgetTemplate: "cost_model_enterprise",
  tenderTemplate: "tender_standard_cn",
  modules: ["quote", "budget", "crm"],
};

export const VERTICAL_REGISTRY: Record<VerticalIndustry, VerticalDefinition> = {
  fitness: FITNESS_VERTICAL,
  education: EDUCATION_VERTICAL,
  procurement: PROCUREMENT_VERTICAL,
  enterprise: ENTERPRISE_VERTICAL,
  hr_admin: HR_ADMIN_VERTICAL,
};

export function registerVerticalIndustry(industry: VerticalIndustry): VerticalDefinition {
  const vertical = VERTICAL_REGISTRY[industry];
  if (!vertical) {
    throw new Error(`Unknown vertical industry: ${industry}`);
  }
  return vertical;
}

export function listVerticalIndustries(): VerticalDefinition[] {
  return Object.values(VERTICAL_REGISTRY);
}

export function loadIndustryTemplate(industry: VerticalIndustry): IndustryTemplateBundle {
  const vertical = registerVerticalIndustry(industry);
  return {
    vertical: vertical.id,
    quote: vertical.quoteTemplate,
    budget: vertical.budgetTemplate,
    tender: vertical.tenderTemplate,
    features: vertical.modules,
  };
}

export function scaleProductAcrossIndustries(): IndustryTemplateBundle[] {
  return listVerticalIndustries().map((v) => loadIndustryTemplate(v.id));
}
