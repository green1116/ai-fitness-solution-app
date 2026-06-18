import { SKU_PRICE_BANDS, type ProductSku, type ProjectComplexity, type SlaTier } from "../shared/constants";
import type { PricingQuote, ProductPackagingInput } from "../shared/types";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolveAreaFactor(areaSqm: number): number {
  if (areaSqm <= 150) return 0.95;
  if (areaSqm <= 300) return 1;
  if (areaSqm <= 600) return 1.08;
  return 1.15;
}

function resolveHeadcountFactor(headcount: number): number {
  if (headcount <= 100) return 0.95;
  if (headcount <= 250) return 1;
  if (headcount <= 500) return 1.06;
  return 1.12;
}

function resolveBudgetFactor(budgetCny: number): number {
  if (budgetCny <= 300_000) return 0.96;
  if (budgetCny <= 800_000) return 1;
  if (budgetCny <= 1_500_000) return 1.05;
  return 1.1;
}

function resolveComplexityFactor(complexity: ProjectComplexity): number {
  if (complexity === "low") return 0.95;
  if (complexity === "medium") return 1;
  return 1.12;
}

function resolveSlaFactor(slaTier: SlaTier): number {
  if (slaTier === "48h") return 1.15;
  if (slaTier === "72h") return 1.08;
  if (slaTier === "7d") return 1;
  return 0.95;
}

export function calculatePricingQuote(input: {
  sku: ProductSku;
  input: ProductPackagingInput;
  complexity: ProjectComplexity;
  slaTier: SlaTier;
}): PricingQuote {
  const band = SKU_PRICE_BANDS[input.sku];
  const areaFactor = resolveAreaFactor(input.input.areaSqm);
  const headcountFactor = resolveHeadcountFactor(input.input.headcount);
  const budgetFactor = resolveBudgetFactor(input.input.budgetCny);
  const complexityFactor = resolveComplexityFactor(input.complexity);
  const slaFactor = resolveSlaFactor(input.slaTier);

  const midpoint = (band.minCny + band.maxCny) / 2;
  const raw =
    midpoint * areaFactor * headcountFactor * budgetFactor * complexityFactor * slaFactor;
  const suggestedPriceCny = Math.round(clamp(raw, band.minCny, band.maxCny) / 100) * 100;

  return {
    quoteId: `cp-quote-${input.sku}-${input.input.projectName.replace(/\s+/g, "-").toLowerCase()}`,
    sku: input.sku,
    suggestedPriceCny,
    priceMinCny: band.minCny,
    priceMaxCny: band.maxCny,
    complexity: input.complexity,
    slaTier: input.slaTier,
    factors: {
      areaFactor,
      headcountFactor,
      budgetFactor,
      complexityFactor,
      slaFactor,
    },
    summary: `quote=${suggestedPriceCny} range=${band.minCny}-${band.maxCny} complexity=${input.complexity} sla=${input.slaTier}`,
  };
}
