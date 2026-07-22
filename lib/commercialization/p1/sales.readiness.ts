/**
 * Commercialization P1 — Sales foundation readiness
 */

import {
  COMMERCIALIZATION_SALES_FOUNDATION_BASE,
} from "./sales/sales.constants";
import { listCustomerLifecycleRecords } from "./customer/customer.lifecycle";
import { listSalesCustomers } from "./customer/customer.registry";
import { listCommercialOffers } from "./offer/offer.catalog";
import { listOfferPricing } from "./offer/offer.pricing";
import { listPipelineEntries } from "./sales/sales.pipeline";
import { listSalesMetrics } from "./sales/sales.metrics";
import { listOpportunities } from "./sales/sales.registry";
import type {
  SalesReadinessCheck,
  SalesReadinessResult,
} from "./sales/sales.types";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../evolution/signoff/governance.freeze.lock";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): SalesReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateSalesFoundationReadiness(): SalesReadinessResult {
  const checks: SalesReadinessCheck[] = [];

  checks.push(
    check(
      "COM-P1-BASE",
      "foundation",
      "Evolution complete baseline aligned",
      COMMERCIALIZATION_SALES_FOUNDATION_BASE ===
        ENTERPRISE_EVOLUTION_COMPLETE_ID,
      `base=${COMMERCIALIZATION_SALES_FOUNDATION_BASE}`,
    ),
  );

  const offers = listCommercialOffers({ active: true });
  checks.push(
    check(
      "COM-P1-OFFER",
      "offer",
      "Active offers in catalog",
      offers.length >= 1,
      `offers=${offers.length}`,
    ),
  );

  const pricing = listOfferPricing();
  checks.push(
    check(
      "COM-P1-PRICING",
      "offer",
      "Offer pricing present",
      pricing.length >= 1,
      `pricing=${pricing.length}`,
    ),
  );

  const customers = listSalesCustomers();
  checks.push(
    check(
      "COM-P1-CUSTOMER",
      "customer",
      "Customers registered",
      customers.length >= 1,
      `customers=${customers.length}`,
    ),
  );

  const lifecycles = listCustomerLifecycleRecords();
  checks.push(
    check(
      "COM-P1-LIFECYCLE",
      "customer",
      "Customer lifecycle transitions present",
      lifecycles.length >= 1,
      `lifecycles=${lifecycles.length}`,
    ),
  );

  const opportunities = listOpportunities();
  checks.push(
    check(
      "COM-P1-OPP",
      "sales",
      "Sales opportunities registered",
      opportunities.length >= 1,
      `opportunities=${opportunities.length}`,
    ),
  );

  const pipeline = listPipelineEntries();
  checks.push(
    check(
      "COM-P1-PIPELINE",
      "sales",
      "Pipeline movements present",
      pipeline.length >= 1,
      `pipeline=${pipeline.length}`,
    ),
  );

  const metrics = listSalesMetrics();
  checks.push(
    check(
      "COM-P1-METRICS",
      "sales",
      "Sales metrics computed",
      metrics.length >= 1,
      `metrics=${metrics.length}`,
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
    summary: `sales foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertSalesFoundationReadinessReady(
  result: SalesReadinessResult,
): asserts result is SalesReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`sales foundation not ready: ${result.summary}`);
  }
}
