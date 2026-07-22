/**
 * Commercialization P3 — Pricing & Contract Foundation Release Gate
 * BASE: enterprise-commercialization-p2-product-packaging-foundation-v1
 * Isolated namespace — does not mutate E01–E12 or P1/P2 layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { COMMERCIALIZATION_SALES_FOUNDATION_ID } from "../../p1/sales/sales.constants";
import {
  COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
} from "../../p2/tier/tier.constants";
import {
  BILLING_CYCLES,
  COMMERCIAL_MODELS,
  COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_BASE,
  COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION,
  COMMERCIALIZATION_PRICING_CONTRACT_ID,
  COMMERCIALIZATION_PRICING_CONTRACT_VERSION,
  CONTRACT_STATUSES,
  PRICE_BOOK_STATUSES,
  PRICING_MANAGER_STATUSES,
  PRICING_READINESS_VERDICTS,
  QUOTE_STATUSES,
  TERM_KINDS,
} from "../pricing/pricing.constants";
import {
  assertPricingContractReadinessReady,
  clearPricingContractLayer,
  createPricingContractFoundationManager,
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

export const COMMERCIALIZATION_P3_SIGNOFF_VERSION =
  "commercialization-p3-signoff-1" as const;

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
  clearPricingContractLayer();
}

export function checkCommercializationP3ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "COM-P3-CONSTANTS",
      "pricing",
      "Pricing & contract version constants",
      COMMERCIALIZATION_PRICING_CONTRACT_ID ===
        "enterprise-commercialization-p3-pricing-contract-foundation-v1" &&
        COMMERCIALIZATION_PRICING_CONTRACT_VERSION ===
          "commercialization-p3-1" &&
        COMMERCIALIZATION_PRICING_CONTRACT_BASE ===
          COMMERCIALIZATION_PRODUCT_PACKAGING_ID &&
        COMMERCIALIZATION_PRICING_CONTRACT_BASE ===
          "enterprise-commercialization-p2-product-packaging-foundation-v1" &&
        COMMERCIALIZATION_PRICING_CONTRACT_FREEZE_VERSION ===
          "commercialization-pricing-contract-foundation-freeze-1" &&
        COMMERCIALIZATION_P3_PRICING_FREEZE_VERSION ===
          "commercialization-p3-pricing-contract-foundation-freeze-1" &&
        PRICE_BOOK_STATUSES.length === 3 &&
        BILLING_CYCLES.length === 3 &&
        QUOTE_STATUSES.length === 5 &&
        CONTRACT_STATUSES.length === 6 &&
        TERM_KINDS.length === 5 &&
        COMMERCIAL_MODELS.length === 4 &&
        PRICING_READINESS_VERDICTS.length === 3 &&
        PRICING_MANAGER_STATUSES.length === 4,
      `id=${COMMERCIALIZATION_PRICING_CONTRACT_ID} base=${COMMERCIALIZATION_PRICING_CONTRACT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "COM-P3-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "COM-P3-P2-BASE",
      "packaging",
      "P2 packaging foundation freeze preserved as BASE",
      COMMERCIALIZATION_PRODUCT_PACKAGING_ID ===
        "enterprise-commercialization-p2-product-packaging-foundation-v1" &&
        COMMERCIALIZATION_PRICING_CONTRACT_BASE ===
          COMMERCIALIZATION_PRODUCT_PACKAGING_ID &&
        COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION ===
          "commercialization-p2-product-packaging-foundation-freeze-1" &&
        COMMERCIALIZATION_SALES_FOUNDATION_ID ===
          "enterprise-commercialization-p1-sales-foundation-v1",
      `p2=${COMMERCIALIZATION_PRODUCT_PACKAGING_ID}`,
    ),
  );

  checks.push(
    check(
      "COM-P3-UPSTREAM",
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
    const mgr = createPricingContractFoundationManager({
      managerId: "comm-p3-gate",
    });
    mgr.initialize();
    mgr.start();

    const book = mgr.registerPriceBook({
      id: "comm.p3.gate.pricebook",
      name: "Professional Annual",
      packageRef: "comm.p2.gate.package",
      unitAmount: 1200,
      billingCycle: "ANNUAL",
      discountPercent: 10,
    });
    mgr.activatePriceBook(book.id);

    const term = mgr.defineTerm({
      id: "comm.p3.gate.term",
      name: "Net-30 Payment",
      kind: "PAYMENT",
      body: "Invoices due within 30 days",
      mandatory: true,
    });
    const model = mgr.defineModel({
      id: "comm.p3.gate.model",
      name: "Subscription Commercial Model",
      model: "SUBSCRIPTION",
      billingCycleDefault: "ANNUAL",
      autoRenew: true,
      minimumTermMonths: 12,
    });

    const quote = mgr.registerQuote({
      id: "comm.p3.gate.quote",
      name: "Acme Annual Quote",
      customerRef: "acme-fitness",
      priceBookId: book.id,
      quantity: 2,
      validDays: 45,
    });
    const composition = mgr.composeQuote({
      id: "comm.p3.gate.qcomp",
      quoteId: quote.id,
      taxPercent: 5,
    });

    const contract = mgr.registerContract({
      id: "comm.p3.gate.contract",
      name: "Acme Master Agreement",
      quoteId: quote.id,
      commercialModelId: model.id,
      termsIds: [term.id],
      termMonths: 12,
    });
    const lifecycle = mgr.transitionContract({
      id: "comm.p3.gate.lifecycle",
      contractId: contract.id,
      status: "ACTIVE",
      reason: "customer signed",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getPricingRegistryManifest();

    const ok =
      composition.composedTotal > 0 &&
      lifecycle.status === "ACTIVE" &&
      readiness.verdict === "READY" &&
      registry.foundationId === COMMERCIALIZATION_PRICING_CONTRACT_ID &&
      registry.base === COMMERCIALIZATION_PRICING_CONTRACT_BASE &&
      registry.priceBookCount >= 1 &&
      registry.calculationCount >= 1 &&
      registry.quoteCount >= 1 &&
      registry.compositionCount >= 1 &&
      registry.contractCount >= 1 &&
      registry.lifecycleCount >= 1 &&
      registry.termsCount >= 1 &&
      registry.modelCount >= 1;

    try {
      assertPricingContractReadinessReady(readiness);
      checks.push(
        check(
          "COM-P3-STACK",
          "pricing",
          "Price / quote / contract / terms / model / readiness",
          ok,
          `total=${composition.composedTotal} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "COM-P3-STACK",
          "pricing",
          "Price / quote / contract / terms / model / readiness",
          false,
          error instanceof Error
            ? error.message
            : "pricing-contract foundation not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "COM-P3-STACK",
        "pricing",
        "Price / quote / contract / terms / model / readiness",
        false,
        error instanceof Error
          ? error.message
          : "pricing-contract foundation probe failed",
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
      `commercialization-p3-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertCommercializationP3ReleaseGatePass(
  gate: ReleaseGateResult = checkCommercializationP3ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Commercialization P3 release gate failed: ${gate.summary}`,
    );
  }
}
