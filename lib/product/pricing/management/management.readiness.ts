/**
 * Product Pricing — readiness
 */

import { PRODUCT_SUBSCRIPTION_LIFECYCLE_ID } from "../../subscription/lifecycle/lifecycle.constants";
import { listCatalogs } from "../catalog/catalog.registry";
import { listDiscounts } from "../discount/discount.registry";
import { listPrices } from "../price/price.registry";
import { listQuotes } from "../quote/quote.registry";
import { PRODUCT_PRICING_MANAGEMENT_BASE } from "./management.constants";
import type {
  PricingReadinessCheck,
  PricingReadinessResult,
} from "./management.types";

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

export function evaluatePricingManagementReadiness(): PricingReadinessResult {
  const checks: PricingReadinessCheck[] = [];

  checks.push(
    check(
      "PRI-BASE",
      "foundation",
      "Subscription lifecycle baseline aligned",
      PRODUCT_PRICING_MANAGEMENT_BASE === PRODUCT_SUBSCRIPTION_LIFECYCLE_ID,
      `base=${PRODUCT_PRICING_MANAGEMENT_BASE}`,
    ),
  );

  const catalogs = listCatalogs();
  checks.push(
    check(
      "PRI-CAT",
      "catalog",
      "Published catalogs present",
      catalogs.some((c) => c.status === "PUBLISHED"),
      `catalogs=${catalogs.length}`,
    ),
  );

  const prices = listPrices();
  checks.push(
    check(
      "PRI-PRC",
      "price",
      "Active plan prices present",
      prices.some((p) => p.active),
      `prices=${prices.length}`,
    ),
  );

  const discounts = listDiscounts();
  checks.push(
    check(
      "PRI-DSC",
      "discount",
      "Active discounts present",
      discounts.some((d) => d.active),
      `discounts=${discounts.length}`,
    ),
  );

  const quotes = listQuotes();
  checks.push(
    check(
      "PRI-QTE",
      "quote",
      "Accepted quotes present",
      quotes.some((q) => q.status === "ACCEPTED"),
      `quotes=${quotes.length}`,
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
    summary: `product-pricing readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertPricingManagementReadinessReady(
  result: PricingReadinessResult,
): asserts result is PricingReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product pricing management not ready: ${result.summary}`,
    );
  }
}
