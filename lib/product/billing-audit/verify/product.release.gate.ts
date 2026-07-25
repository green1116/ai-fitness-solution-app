/**
 * Product Billing Audit — Billing Traceability Release Gate
 * MODULE: Billing Audit
 * BASE: enterprise-product-payment-integration-v1
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
import { PRODUCT_INVOICE_ENGINE_ID } from "../../invoice/engine/engine.constants";
import { PRODUCT_USAGE_METERING_ID } from "../../metering/usage/usage.constants";
import { PRODUCT_PAYMENT_INTEGRATION_ID } from "../../payment/integration/integration.constants";
import { PRODUCT_PRICING_MANAGEMENT_ID } from "../../pricing/management/management.constants";
import { PRODUCT_SUBSCRIPTION_LIFECYCLE_ID } from "../../subscription/lifecycle/lifecycle.constants";
import {
  assertBillingAuditReadinessReady,
  clearBillingAuditLayer,
  createBillingAuditManager,
  getBillingAuditRegistryManifest,
} from "../billing-audit.manager";
import {
  BILLING_AUDIT_CATEGORIES,
  BILLING_AUDIT_MANAGER_STATUSES,
  BILLING_AUDIT_READINESS_VERDICTS,
  BILLING_AUDIT_SEVERITIES,
  BILLING_INTEGRITY_RESULTS,
  BILLING_TRAIL_STATUSES,
  PRODUCT_BILLING_AUDIT_BASE,
  PRODUCT_BILLING_AUDIT_FREEZE_TAG,
  PRODUCT_BILLING_AUDIT_FREEZE_VERSION,
  PRODUCT_BILLING_AUDIT_ID,
  PRODUCT_BILLING_AUDIT_VERSION,
} from "../traceability/traceability.constants";

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

export const PRODUCT_BILLING_AUDIT_SIGNOFF_VERSION =
  "product-billing-audit-signoff-1" as const;

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
  clearBillingAuditLayer();
}

export function checkProductBillingAuditReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "BAU-CONSTANTS",
      "traceability",
      "Product billing audit version constants",
      PRODUCT_BILLING_AUDIT_ID === "enterprise-product-billing-audit-v1" &&
        PRODUCT_BILLING_AUDIT_VERSION === "product-billing-audit-1" &&
        PRODUCT_BILLING_AUDIT_BASE === PRODUCT_PAYMENT_INTEGRATION_ID &&
        PRODUCT_BILLING_AUDIT_FREEZE_VERSION ===
          "product-billing-audit-freeze-1" &&
        PRODUCT_BILLING_AUDIT_FREEZE_TAG ===
          "product-billing-audit-freeze-1" &&
        BILLING_AUDIT_CATEGORIES.length === 4 &&
        BILLING_AUDIT_SEVERITIES.length === 3 &&
        BILLING_TRAIL_STATUSES.length === 3 &&
        BILLING_INTEGRITY_RESULTS.length === 2 &&
        BILLING_AUDIT_READINESS_VERDICTS.length === 3 &&
        BILLING_AUDIT_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_BILLING_AUDIT_ID} base=${PRODUCT_BILLING_AUDIT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "BAU-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "BAU-PAY-BASE",
      "product-payment",
      "Payment integration BASE preserved",
      PRODUCT_BILLING_AUDIT_BASE ===
        "enterprise-product-payment-integration-v1" &&
        PRODUCT_PAYMENT_INTEGRATION_ID ===
          "enterprise-product-payment-integration-v1" &&
        PRODUCT_USAGE_METERING_ID ===
          "enterprise-product-usage-metering-v1" &&
        PRODUCT_INVOICE_ENGINE_ID ===
          "enterprise-product-invoice-engine-v1" &&
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
      `base=${PRODUCT_BILLING_AUDIT_BASE}`,
    ),
  );

  checks.push(
    check(
      "BAU-UPSTREAM",
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
    const mgr = createBillingAuditManager({ managerId: "prod-bau-gate" });
    mgr.initialize();
    mgr.start();

    const event = mgr.recordBillingAuditEvent({
      id: "bau.gate.evt",
      category: "PAYMENT",
      severity: "INFO",
      accountId: "bil.gate.acc",
      action: "payment.capture",
      resource: "pay.gate.cap",
      amountCents: 27500,
    });
    const trail = mgr.appendBillingTrail({
      id: "bau.gate.trl",
      eventId: event.id,
    });
    const seal = mgr.sealBillingTrail({
      id: "bau.gate.sel",
      trailId: trail.id,
    });
    const verified = mgr.verifyBillingSeal({ sealId: seal.id });
    const query = mgr.queryBillingAudit({
      id: "bau.gate.qry",
      category: "PAYMENT",
      accountId: "bil.gate.acc",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getBillingAuditRegistryManifest();

    const ok =
      verified.result === "INTACT" &&
      query.matchCount >= 1 &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_BILLING_AUDIT_ID &&
      registry.base === PRODUCT_BILLING_AUDIT_BASE &&
      registry.eventCount >= 1 &&
      registry.trailCount >= 1 &&
      registry.sealCount >= 1 &&
      registry.queryCount >= 1;

    try {
      assertBillingAuditReadinessReady(readiness);
      checks.push(
        check(
          "BAU-STACK",
          "traceability",
          "Event / trail / integrity / query",
          ok,
          `readiness=${readiness.verdict} seal=${verified.result}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "BAU-STACK",
          "traceability",
          "Event / trail / integrity / query",
          false,
          error instanceof Error
            ? error.message
            : "product billing audit not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "BAU-STACK",
        "traceability",
        "Event / trail / integrity / query",
        false,
        error instanceof Error
          ? error.message
          : "product billing audit probe failed",
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
      `product-billing-audit-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductBillingAuditReleaseGatePass(
  gate: ReleaseGateResult = checkProductBillingAuditReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product billing audit release gate failed: ${gate.summary}`,
    );
  }
}
