import {
  CP_CANONICAL_ID,
  type DeliverableType,
  type ProductSku,
  type ProjectComplexity,
  type SlaTier,
} from "../shared/constants";
import { getProductCatalogEntry } from "../product-catalog/product-catalog";
import { buildIntelligenceSnapshot } from "../shared/intelligence-snapshot";
import type {
  IntelligenceSnapshot,
  ProductDeliverable,
  ProductPackageResult,
  ProductPackagingInput,
} from "../shared/types";
import { calculatePricingQuote } from "../pricing/pricing-engine";
import { assignSla } from "../sla/sla-engine";
import { buildContractTemplate } from "../contracts/contract-template";

const DELIVERABLE_LABELS: Record<DeliverableType, { name: string; format: "pdf" | "report" }> = {
  "plan-pdf": { name: "Plan PDF", format: "pdf" },
  "budget-pdf": { name: "Budget PDF", format: "pdf" },
  "brand-summary": { name: "Brand Summary", format: "report" },
  "risk-summary": { name: "Risk Summary", format: "report" },
  "procurement-summary": { name: "Procurement Summary", format: "report" },
  "tender-summary": { name: "Tender Summary", format: "report" },
  "delivery-report": { name: "Delivery Report", format: "report" },
};

function buildDeliverableSummary(
  type: DeliverableType,
  input: ProductPackagingInput,
  intelligence: IntelligenceSnapshot,
): string {
  switch (type) {
    case "plan-pdf":
      return `plan for ${input.projectName} area=${input.areaSqm}sqm headcount=${input.headcount}`;
    case "budget-pdf":
      return `budget aligned to CNY ${input.budgetCny}`;
    case "brand-summary":
      return `brand coverage=${intelligence.brandCount} requirements=${intelligence.requirementCount}`;
    case "risk-summary":
      return `delivery risk context projects=${intelligence.projectCount}`;
    case "procurement-summary":
      return `procurement decisions=${intelligence.procurementDecisionCount}`;
    case "tender-summary":
      return `tenders=${intelligence.tenderCount} outcomes=${intelligence.winLossOutcomeCount}`;
    case "delivery-report":
      return `performanceAvg=${intelligence.performanceAverageScore} optimizations=${intelligence.optimizationOpportunityCount}`;
  }
}

function buildDeliverables(
  sku: ProductSku,
  input: ProductPackagingInput,
  intelligence: IntelligenceSnapshot,
): ProductDeliverable[] {
  const catalog = getProductCatalogEntry(sku);

  return catalog.deliverables.map((type) => {
    const meta = DELIVERABLE_LABELS[type];
    return {
      deliverableId: `cp-deliverable-${sku}-${type}`,
      type,
      name: meta.name,
      format: meta.format,
      ready: true,
      summary: buildDeliverableSummary(type, input, intelligence),
    };
  });
}

function resolveComplexity(input: ProductPackagingInput): ProjectComplexity {
  if (input.complexity) return input.complexity;
  if (input.areaSqm >= 800 || input.headcount >= 500) return "high";
  if (input.areaSqm >= 300 || input.headcount >= 200) return "medium";
  return "low";
}

export function buildProductPackageCore(
  sku: ProductSku,
  input: ProductPackagingInput,
): ProductPackageResult {
  const intelligence = buildIntelligenceSnapshot();
  const complexity = resolveComplexity(input);
  const slaTier: SlaTier = input.slaTier ?? getProductCatalogEntry(sku).slaTier;
  const pricing = calculatePricingQuote({ sku, input, complexity, slaTier });
  const sla = assignSla({ sku, tier: slaTier, projectName: input.projectName });
  const deliverables = buildDeliverables(sku, input, intelligence);
  const contract = buildContractTemplate({
    projectName: input.projectName,
    sku,
    pricing,
    sla,
    deliverables,
  });

  return {
    packageId: `cp-package-${sku}-${input.projectName.replace(/\s+/g, "-").toLowerCase()}`,
    sku,
    projectName: input.projectName,
    deliverables,
    intelligence,
    pricing,
    sla,
    contract,
    mode: CP_CANONICAL_ID,
  };
}
