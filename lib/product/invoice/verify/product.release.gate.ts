/**
 * Product Invoice — Invoice Engine Release Gate
 * MODULE: Invoice
 * BASE: enterprise-product-pricing-management-v1
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
import { PRODUCT_PRICING_MANAGEMENT_ID } from "../../pricing/management/management.constants";
import { PRODUCT_SUBSCRIPTION_LIFECYCLE_ID } from "../../subscription/lifecycle/lifecycle.constants";
import {
  DOCUMENT_STATUSES,
  INVOICE_MANAGER_STATUSES,
  INVOICE_READINESS_VERDICTS,
  LINE_KINDS,
  PRODUCT_INVOICE_ENGINE_BASE,
  PRODUCT_INVOICE_ENGINE_FREEZE_VERSION,
  PRODUCT_INVOICE_ENGINE_ID,
  PRODUCT_INVOICE_ENGINE_VERSION,
  PRODUCT_INVOICE_FREEZE_VERSION,
  SETTLEMENT_RESULTS,
  TAX_MODES,
} from "../engine/engine.constants";
import {
  assertInvoiceEngineReadinessReady,
  clearInvoiceEngineLayer,
  createInvoiceManager,
  getInvoiceRegistryManifest,
} from "../invoice.manager";

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

export const PRODUCT_INVOICE_SIGNOFF_VERSION =
  "product-invoice-signoff-1" as const;

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
  clearInvoiceEngineLayer();
}

export function checkProductInvoiceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "INV-CONSTANTS",
      "engine",
      "Product invoice engine version constants",
      PRODUCT_INVOICE_ENGINE_ID === "enterprise-product-invoice-engine-v1" &&
        PRODUCT_INVOICE_ENGINE_VERSION === "product-invoice-1" &&
        PRODUCT_INVOICE_ENGINE_BASE === PRODUCT_PRICING_MANAGEMENT_ID &&
        PRODUCT_INVOICE_ENGINE_FREEZE_VERSION ===
          "product-invoice-engine-freeze-1" &&
        PRODUCT_INVOICE_FREEZE_VERSION === "product-invoice-engine-freeze-1" &&
        DOCUMENT_STATUSES.length === 4 &&
        LINE_KINDS.length === 3 &&
        TAX_MODES.length === 3 &&
        SETTLEMENT_RESULTS.length === 3 &&
        INVOICE_READINESS_VERDICTS.length === 3 &&
        INVOICE_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_INVOICE_ENGINE_ID} base=${PRODUCT_INVOICE_ENGINE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "INV-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "INV-PRI-BASE",
      "product-pricing",
      "Pricing management BASE preserved",
      PRODUCT_INVOICE_ENGINE_BASE ===
        "enterprise-product-pricing-management-v1" &&
        PRODUCT_PRICING_MANAGEMENT_ID ===
          "enterprise-product-pricing-management-v1" &&
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
      `base=${PRODUCT_INVOICE_ENGINE_BASE}`,
    ),
  );

  checks.push(
    check(
      "INV-UPSTREAM",
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
    const mgr = createInvoiceManager({ managerId: "prod-inv-gate" });
    mgr.initialize();
    mgr.start();

    const document = mgr.createDocument({
      id: "inv.gate.doc",
      accountId: "bil.gate.acc",
      number: "INV-GATE-0001",
    });
    mgr.addLine({
      id: "inv.gate.ln",
      documentId: document.id,
      description: "Enterprise seats",
      quantity: 10,
      unitCents: 2500,
    });
    mgr.applyTax({
      id: "inv.gate.tax",
      documentId: document.id,
      mode: "EXCLUSIVE",
      rateBps: 1000,
    });
    const issued = mgr.issueDocument({ documentId: document.id });
    const settlement = mgr.settleDocument({
      id: "inv.gate.set",
      documentId: document.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getInvoiceRegistryManifest();

    const ok =
      issued.totalCents === 27500 &&
      settlement.result === "SETTLED" &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_INVOICE_ENGINE_ID &&
      registry.base === PRODUCT_INVOICE_ENGINE_BASE &&
      registry.documentCount >= 1 &&
      registry.lineCount >= 1 &&
      registry.taxCount >= 1 &&
      registry.settlementCount >= 1;

    try {
      assertInvoiceEngineReadinessReady(readiness);
      checks.push(
        check(
          "INV-STACK",
          "engine",
          "Document / line / tax / settlement",
          ok,
          `readiness=${readiness.verdict} total=${issued.totalCents}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "INV-STACK",
          "engine",
          "Document / line / tax / settlement",
          false,
          error instanceof Error
            ? error.message
            : "product invoice not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "INV-STACK",
        "engine",
        "Document / line / tax / settlement",
        false,
        error instanceof Error
          ? error.message
          : "product invoice probe failed",
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
      `product-invoice-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductInvoiceReleaseGatePass(
  gate: ReleaseGateResult = checkProductInvoiceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product invoice release gate failed: ${gate.summary}`,
    );
  }
}
