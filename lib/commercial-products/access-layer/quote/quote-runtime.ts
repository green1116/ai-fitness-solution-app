import {
  PRODUCT_SKU,
  SKU_PRICE_BANDS,
  type ProductSku,
  type ProjectComplexity,
} from "@/lib/commercial-products/shared/constants";
import { getProductCatalogEntry } from "@/lib/commercial-products/product-catalog/product-catalog";
import { calculatePricingQuote } from "@/lib/commercial-products/pricing/pricing-engine";
import { assignSla } from "@/lib/commercial-products/sla/sla-engine";
import { CP_ACCESS_CANONICAL_ID, CP_ACCESS_VERSION } from "../shared/constants";
import { checkProductEligibility } from "../validation/sales-access-validation";
import type { QuoteRequest, QuoteResponse, QuoteSnapshot } from "../shared/types";

function resolveComplexity(request: QuoteRequest): ProjectComplexity {
  if (request.complexity) return request.complexity;
  if (request.areaSqm >= 800 || request.headcount >= 500) return "high";
  if (request.areaSqm >= 300 || request.headcount >= 200) return "medium";
  return "low";
}

function assertSku(sku: string): asserts sku is ProductSku {
  if (!PRODUCT_SKU.includes(sku as ProductSku)) {
    throw new Error(`Unknown product SKU: ${sku}`);
  }
}

function buildQuoteSnapshot(input: {
  request: QuoteRequest;
  quoteId: string;
  price: number;
  slaTier: string;
  eligible: boolean;
  reasons: string[];
}): QuoteSnapshot {
  const band = SKU_PRICE_BANDS[input.request.sku];
  return {
    quoteId: input.quoteId,
    sku: input.request.sku,
    price: input.price,
    priceBand: { min: band.minCny, max: band.maxCny },
    sla: input.slaTier,
    eligible: input.eligible,
    reasons: input.reasons,
    inputs: input.request,
    createdAt: new Date().toISOString(),
  };
}

export function runQuoteRuntime(request: QuoteRequest): QuoteResponse {
  assertSku(request.sku);

  if (!request.projectName?.trim()) {
    throw new Error("projectName is required");
  }

  const catalogEntry = getProductCatalogEntry(request.sku);
  const eligibility = checkProductEligibility(request.sku, request);
  const complexity = resolveComplexity(request);
  const slaTier = request.slaTier ?? catalogEntry.slaTier;

  const packagingInput = {
    projectName: request.projectName.trim(),
    areaSqm: request.areaSqm,
    headcount: request.headcount,
    budgetCny: request.budgetCny,
    complexity,
    slaTier,
  };

  const pricing = calculatePricingQuote({
    sku: request.sku,
    input: packagingInput,
    complexity,
    slaTier,
  });

  const sla = assignSla({
    sku: request.sku,
    tier: slaTier,
    projectName: packagingInput.projectName,
  });

  const snapshot = buildQuoteSnapshot({
    request,
    quoteId: pricing.quoteId,
    price: pricing.suggestedPriceCny,
    slaTier: sla.tier,
    eligible: eligibility.eligible,
    reasons: eligibility.reasons,
  });

  return {
    ok: true,
    snapshot,
    pricing,
    sla,
    catalogEntry: {
      sku: catalogEntry.sku,
      name: catalogEntry.name,
      deliverables: catalogEntry.deliverables,
      slaTier: catalogEntry.slaTier,
    },
  };
}

export function getQuoteRuntimeMeta() {
  return {
    runtimeId: "cp-quote-runtime-v47-p2-s1",
    version: CP_ACCESS_VERSION,
    mode: CP_ACCESS_CANONICAL_ID,
  };
}
