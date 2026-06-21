/**
 * V60 P4 — Tender template engine
 */

import type { TenderTemplateId } from "../expansion.types";

export type TenderTemplate = {
  id: TenderTemplateId;
  name: string;
  locale: string;
  attachments: string[];
};

export const TENDER_TEMPLATES: Record<TenderTemplateId, TenderTemplate> = {
  tender_standard_cn: {
    id: "tender_standard_cn",
    name: "Standard CN Tender Pack",
    locale: "zh-CN",
    attachments: ["technical_proposal", "commercial_bid", "compliance_matrix"],
  },
  tender_enterprise_pro: {
    id: "tender_enterprise_pro",
    name: "Enterprise Pro Tender Pack",
    locale: "zh-CN",
    attachments: [
      "executive_summary",
      "technical_proposal",
      "commercial_bid",
      "compliance_matrix",
      "equipment_catalog",
      "service_sla",
    ],
  },
};

export function getTenderTemplate(id: TenderTemplateId): TenderTemplate {
  const template = TENDER_TEMPLATES[id];
  if (!template) throw new Error(`Tender template not found: ${id}`);
  return template;
}
