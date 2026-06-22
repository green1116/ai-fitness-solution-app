/**
 * Prisma Stability — business domain naming map
 */

export type BusinessDomain =
  | "crm"
  | "marketing"
  | "billing"
  | "growth"
  | "product"
  | "legacy";

export type ModelOwnership = {
  model: string;
  domain: BusinessDomain;
  concept: string;
  aliases?: string[];
};

export const BUSINESS_DOMAIN_MAP: ModelOwnership[] = [
  { model: "Lead", domain: "crm", concept: "sales_lead", aliases: ["crm_lead"] },
  { model: "MarketingLead", domain: "marketing", concept: "marketing_lead" },
  { model: "Customer", domain: "crm", concept: "customer", aliases: ["crm_customer"] },
  { model: "Organization", domain: "product", concept: "organization" },
  { model: "Opportunity", domain: "crm", concept: "opportunity" },
  { model: "Deal", domain: "crm", concept: "deal" },
  { model: "CRMActivity", domain: "crm", concept: "activity" },
  { model: "Subscription", domain: "billing", concept: "subscription" },
  { model: "Payment", domain: "billing", concept: "payment" },
  { model: "SaasInvoice", domain: "billing", concept: "invoice" },
  { model: "UsageRecord", domain: "billing", concept: "usage" },
  { model: "DownloadLead", domain: "marketing", concept: "download_lead" },
  { model: "Quote", domain: "product", concept: "quote" },
  { model: "Tender", domain: "product", concept: "tender" },
];

export function getModelOwnership(modelName: string): ModelOwnership | undefined {
  return BUSINESS_DOMAIN_MAP.find((m) => m.model === modelName);
}

export function listConflictingModelNames(): string[] {
  const concepts = new Map<string, string[]>();
  for (const entry of BUSINESS_DOMAIN_MAP) {
    const list = concepts.get(entry.concept) ?? [];
    list.push(entry.model);
    concepts.set(entry.concept, list);
  }
  return [...concepts.entries()].filter(([, models]) => models.length > 1).map(([c]) => c);
}
