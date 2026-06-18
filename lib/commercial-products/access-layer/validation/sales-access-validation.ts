import {
  PRODUCT_SKU,
  SKU_PRICE_BANDS,
  type ProductSku,
} from "@/lib/commercial-products/shared/constants";
import { getProductCatalogEntry } from "@/lib/commercial-products/product-catalog/product-catalog";
import { calculatePricingQuote } from "@/lib/commercial-products/pricing/pricing-engine";
import { assignSla } from "@/lib/commercial-products/sla/sla-engine";
import { SKU_ELIGIBILITY_RULES } from "../shared/constants";
import type {
  CommercialQuoteValidation,
  EligibilityResult,
  QuoteRequest,
  QuoteSnapshot,
} from "../shared/types";

const SAMPLE_REQUEST: QuoteRequest = {
  sku: "kickstart-package",
  projectName: "School Gym Project",
  areaSqm: 320,
  headcount: 180,
  budgetCny: 650_000,
  complexity: "medium",
  slaTier: "7d",
};

export function checkProductEligibility(
  sku: ProductSku,
  request: Pick<QuoteRequest, "areaSqm" | "headcount" | "budgetCny">,
): EligibilityResult {
  const rules = SKU_ELIGIBILITY_RULES[sku];
  const priceBand = SKU_PRICE_BANDS[sku];
  const reasons: string[] = [];

  if (request.areaSqm < rules.minArea) {
    reasons.push(`areaSqm must be >= ${rules.minArea}`);
  }

  if (request.headcount < rules.minHeadcount) {
    reasons.push(`headcount must be >= ${rules.minHeadcount}`);
  }

  if (request.budgetCny < rules.minBudgetCny) {
    reasons.push(`budgetCny must be >= ${rules.minBudgetCny}`);
  }

  if (request.budgetCny > rules.maxBudgetCny) {
    reasons.push(`budgetCny must be <= ${rules.maxBudgetCny}`);
  }

  if (request.budgetCny < priceBand.minCny) {
    reasons.push(`budgetCny must cover minimum service price ${priceBand.minCny}`);
  }

  if (request.budgetCny > priceBand.maxCny * 100) {
    reasons.push(`budgetCny exceeds service price band ceiling for ${sku}`);
  }

  return {
    eligible: reasons.length === 0,
    reasons,
  };
}

export function validateCommercialQuote(input?: {
  snapshot?: QuoteSnapshot;
}): CommercialQuoteValidation {
  const skuExists = PRODUCT_SKU.includes(SAMPLE_REQUEST.sku);
  let eligibilityReady = false;
  let pricingReady = false;
  let slaReady = false;
  let snapshotReady = false;

  try {
    getProductCatalogEntry(SAMPLE_REQUEST.sku);
    const eligibility = checkProductEligibility(SAMPLE_REQUEST.sku, SAMPLE_REQUEST);
    eligibilityReady = typeof eligibility.eligible === "boolean" && Array.isArray(eligibility.reasons);

    const catalogEntry = getProductCatalogEntry(SAMPLE_REQUEST.sku);
    const complexity = SAMPLE_REQUEST.complexity ?? "medium";
    const slaTier = SAMPLE_REQUEST.slaTier ?? catalogEntry.slaTier;
    const pricing = calculatePricingQuote({
      sku: SAMPLE_REQUEST.sku,
      input: {
        projectName: SAMPLE_REQUEST.projectName,
        areaSqm: SAMPLE_REQUEST.areaSqm,
        headcount: SAMPLE_REQUEST.headcount,
        budgetCny: SAMPLE_REQUEST.budgetCny,
        complexity,
        slaTier,
      },
      complexity,
      slaTier,
    });
    pricingReady =
      pricing.suggestedPriceCny >= pricing.priceMinCny &&
      pricing.suggestedPriceCny <= pricing.priceMaxCny;

    const sla = assignSla({
      sku: SAMPLE_REQUEST.sku,
      tier: slaTier,
      projectName: SAMPLE_REQUEST.projectName,
    });
    slaReady = Boolean(sla.tier && sla.dueAtIso);

    const snapshot = input?.snapshot;
    snapshotReady = Boolean(
      snapshot?.quoteId &&
        snapshot.sku &&
        snapshot.price > 0 &&
        snapshot.priceBand.min > 0 &&
        snapshot.sla &&
        typeof snapshot.eligible === "boolean" &&
        snapshot.createdAt,
    );
  } catch {
    // validation flags remain false
  }

  const valid =
    skuExists && eligibilityReady && pricingReady && slaReady && (input?.snapshot ? snapshotReady : true);

  return {
    valid: input?.snapshot ? valid && snapshotReady : skuExists && eligibilityReady && pricingReady && slaReady,
    skuExists,
    eligibilityReady,
    pricingReady,
    slaReady,
    snapshotReady: input?.snapshot ? snapshotReady : true,
    summary: [
      `skuExists=${skuExists}`,
      `eligibilityReady=${eligibilityReady}`,
      `pricingReady=${pricingReady}`,
      `slaReady=${slaReady}`,
      `snapshotReady=${input?.snapshot ? snapshotReady : "n/a"}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
