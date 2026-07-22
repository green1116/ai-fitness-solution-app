/**
 * Commercialization P3 — Pricing & contract readiness
 */

import { COMMERCIALIZATION_PRODUCT_PACKAGING_ID } from "../p2/tier/tier.constants";
import { listCommercialModels } from "./commercial/commercial.model";
import { listCommercialTerms } from "./commercial/commercial.terms";
import { listContractLifecycleRecords } from "./contract/contract.lifecycle";
import { listCommercialContracts } from "./contract/contract.registry";
import { COMMERCIALIZATION_PRICING_CONTRACT_BASE } from "./pricing/pricing.constants";
import { listPriceCalculations } from "./pricing/pricing.calculator";
import { listPriceBooks } from "./pricing/pricing.registry";
import type {
  PricingReadinessCheck,
  PricingReadinessResult,
} from "./pricing/pricing.types";
import { listQuoteCompositions } from "./quote/quote.composer";
import { listCommercialQuotes } from "./quote/quote.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): PricingReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluatePricingContractReadiness(): PricingReadinessResult {
  const checks: PricingReadinessCheck[] = [];

  checks.push(
    check(
      "COM-P3-BASE",
      "foundation",
      "P2 packaging foundation baseline aligned",
      COMMERCIALIZATION_PRICING_CONTRACT_BASE ===
        COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
      `base=${COMMERCIALIZATION_PRICING_CONTRACT_BASE}`,
    ),
  );

  const priceBooks = listPriceBooks({ status: "ACTIVE" });
  checks.push(
    check(
      "COM-P3-PRICE",
      "pricing",
      "Active price books present",
      priceBooks.length >= 1,
      `priceBooks=${priceBooks.length}`,
    ),
  );

  const calcs = listPriceCalculations();
  checks.push(
    check(
      "COM-P3-CALC",
      "pricing",
      "Price calculations present",
      calcs.length >= 1,
      `calculations=${calcs.length}`,
    ),
  );

  const quotes = listCommercialQuotes();
  checks.push(
    check(
      "COM-P3-QUOTE",
      "quote",
      "Quotes registered",
      quotes.length >= 1,
      `quotes=${quotes.length}`,
    ),
  );

  const compositions = listQuoteCompositions();
  checks.push(
    check(
      "COM-P3-QCOMP",
      "quote",
      "Quote compositions present",
      compositions.length >= 1,
      `compositions=${compositions.length}`,
    ),
  );

  const terms = listCommercialTerms();
  checks.push(
    check(
      "COM-P3-TERMS",
      "commercial",
      "Commercial terms defined",
      terms.length >= 1,
      `terms=${terms.length}`,
    ),
  );

  const models = listCommercialModels();
  checks.push(
    check(
      "COM-P3-MODEL",
      "commercial",
      "Commercial models defined",
      models.length >= 1,
      `models=${models.length}`,
    ),
  );

  const contracts = listCommercialContracts();
  checks.push(
    check(
      "COM-P3-CONTRACT",
      "contract",
      "Contracts registered",
      contracts.length >= 1,
      `contracts=${contracts.length}`,
    ),
  );

  const lifecycles = listContractLifecycleRecords();
  checks.push(
    check(
      "COM-P3-LIFE",
      "contract",
      "Contract lifecycle transitions present",
      lifecycles.length >= 1,
      `lifecycles=${lifecycles.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `pricing-contract readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertPricingContractReadinessReady(
  result: PricingReadinessResult,
): asserts result is PricingReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`pricing-contract foundation not ready: ${result.summary}`);
  }
}
