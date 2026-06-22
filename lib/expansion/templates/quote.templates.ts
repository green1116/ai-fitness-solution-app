/**
 * V60 P4 — Quote template engine
 */

import type { QuoteTemplateId } from "../expansion.types";

export type QuoteTemplate = {
  id: QuoteTemplateId;
  name: string;
  sections: string[];
  defaultCompanyFields: string[];
};

export const QUOTE_TEMPLATES: Record<QuoteTemplateId, QuoteTemplate> = {
  fitness_quote_v1: {
    id: "fitness_quote_v1",
    name: "Fitness Solution Quote v1",
    sections: ["executive_summary", "equipment_plan", "layout", "pricing", "timeline"],
    defaultCompanyFields: ["companyName", "city", "areaM2", "targetUsers"],
  },
  education_quote_v1: {
    id: "education_quote_v1",
    name: "Education Campus Quote v1",
    sections: ["campus_overview", "wellness_program", "equipment", "budget_summary"],
    defaultCompanyFields: ["institutionName", "campusSize", "studentCount"],
  },
  enterprise_quote_v1: {
    id: "enterprise_quote_v1",
    name: "Enterprise Solution Quote v1",
    sections: ["executive_summary", "technical_proposal", "commercial", "sla", "timeline"],
    defaultCompanyFields: ["companyName", "industry", "employeeCount"],
  },
};

export function getQuoteTemplate(id: QuoteTemplateId): QuoteTemplate {
  const template = QUOTE_TEMPLATES[id];
  if (!template) throw new Error(`Quote template not found: ${id}`);
  return template;
}
