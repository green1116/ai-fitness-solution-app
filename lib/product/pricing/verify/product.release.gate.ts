/**
 * Product Pricing — Pricing Management Release Gate
 * MODULE: Pricing
 * BASE: enterprise-product-subscription-lifecycle-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { PRODUCT_BILLING_FOUNDATION_ID } from "../../billing/foundation/foundation.constants";
import { PRODUCT_SUBSCRIPTION_LIFECYCLE_ID } from "../../subscription/lifecycle/lifecycle.constants";
import {
  DISCOUNT_KINDS,
  PRICE_MODELS,
  PRICING_CATALOG_STATUSES,
  PRICING_MANAGER_STATUSES,
  PRICING_READINESS_VERDICTS,
  PRODUCT_PRICING_FREEZE_VERSION,
  PRODUCT_PRICING_MANAGEMENT_BASE,
  PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PRICING_MANAGEMENT_ID,
  PRODUCT_PRICING_MANAGEMENT_VERSION,
  QUOTE_STATUSES,
} from "../management/management.constants";
import {
  assertPricingManagementReadinessReady,
  clearPricingManagementLayer,
  createPricingManager,
  getPricingRegistryManifest,
} from "../pricing.manager";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_PRICING_SIGNOFF_VERSION =
  "product-pricing-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearPricingManagementLayer();
}

export function checkProductPricingReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PRI-CONSTANTS",
      "management",
      "Product pricing management version constants",
      PRODUCT_PRICING_MANAGEMENT_ID ===
        "enterprise-product-pricing-management-v1" &&
        PRODUCT_PRICING_MANAGEMENT_VERSION === "product-pricing-1" &&
        PRODUCT_PRICING_MANAGEMENT_BASE === PRODUCT_SUBSCRIPTION_LIFECYCLE_ID &&
        PRODUCT_PRICING_MANAGEMENT_FREEZE_VERSION ===
          "product-pricing-management-freeze-1" &&
        PRODUCT_PRICING_FREEZE_VERSION ===
          "product-pricing-management-freeze-1" &&
        PRICING_CATALOG_STATUSES.length === 3 &&
        PRICE_MODELS.length === 3 &&
        DISCOUNT_KINDS.length === 2 &&
        QUOTE_STATUSES.length === 3 &&
        PRICING_READINESS_VERDICTS.length === 3 &&
        PRICING_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_PRICING_MANAGEMENT_ID} base=${PRODUCT_PRICING_MANAGEMENT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PRI-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "PRI-SUB-BASE",
      "product-subscription",
      "Subscription lifecycle BASE preserved",
      PRODUCT_PRICING_MANAGEMENT_BASE ===
        "enterprise-product-subscription-lifecycle-v1" &&
        PRODUCT_SUBSCRIPTION_LIFECYCLE_ID ===
          "enterprise-product-subscription-lifecycle-v1" &&
        PRODUCT_BILLING_FOUNDATION_ID ===
          "enterprise-product-billing-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_PRICING_MANAGEMENT_BASE}`,
    ),
  );

  checks.push(
    check(
      "PRI-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createPricingManager({ managerId: "prod-pri-gate" });
    mgr.initialize();
    mgr.start();

    const catalog = mgr.createCatalog({
      id: "pri.gate.cat",
      code: "STD-2026",
      name: "Standard 2026",
    });
    mgr.publishCatalog({ catalogId: catalog.id });
    const price = mgr.registerPrice({
      id: "pri.gate.prc",
      catalogId: catalog.id,
      planCode: "ENT-MO",
      model: "PER_SEAT",
      amountCents: 2500,
    });
    const discount = mgr.registerDiscount({
      id: "pri.gate.dsc",
      code: "LAUNCH10",
      kind: "PERCENT",
      value: 10,
    });
    const quote = mgr.createQuote({
      id: "pri.gate.qte",
      priceId: price.id,
      discountId: discount.id,
      seats: 10,
    });
    const accepted = mgr.acceptQuote({ quoteId: quote.id });

    const readiness = mgr.evaluateReadiness();
    const registry = getPricingRegistryManifest();

    const ok =
      accepted.status === "ACCEPTED" &&
      accepted.totalCents === 22500 &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_PRICING_MANAGEMENT_ID &&
      registry.base === PRODUCT_PRICING_MANAGEMENT_BASE &&
      registry.catalogCount >= 1 &&
      registry.priceCount >= 1 &&
      registry.discountCount >= 1 &&
      registry.quoteCount >= 1;

    try {
      assertPricingManagementReadinessReady(readiness);
      checks.push(
        check(
          "PRI-STACK",
          "management",
          "Catalog / price / discount / quote",
          ok,
          `readiness=${readiness.verdict} total=${accepted.totalCents}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "PRI-STACK",
          "management",
          "Catalog / price / discount / quote",
          false,
          error instanceof Error
            ? error.message
            : "product pricing not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "PRI-STACK",
        "management",
        "Catalog / price / discount / quote",
        false,
        error instanceof Error
          ? error.message
          : "product pricing probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-pricing-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductPricingReleaseGatePass(
  gate: ReleaseGateResult = checkProductPricingReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product pricing release gate failed: ${gate.summary}`,
    );
  }
}
