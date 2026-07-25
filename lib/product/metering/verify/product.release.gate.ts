/**
 * Product Metering — Usage Metering Release Gate
 * MODULE: Usage Metering
 * BASE: enterprise-product-invoice-engine-v1
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
import { PRODUCT_PRICING_MANAGEMENT_ID } from "../../pricing/management/management.constants";
import { PRODUCT_SUBSCRIPTION_LIFECYCLE_ID } from "../../subscription/lifecycle/lifecycle.constants";
import {
  assertUsageMeteringReadinessReady,
  clearUsageMeteringLayer,
  createMeteringManager,
  getMeteringRegistryManifest,
} from "../metering.manager";
import {
  AGGREGATION_WINDOWS,
  METER_STATUSES,
  METER_UNITS,
  METERING_MANAGER_STATUSES,
  METERING_READINESS_VERDICTS,
  PRODUCT_METERING_FREEZE_VERSION,
  PRODUCT_USAGE_METERING_BASE,
  PRODUCT_USAGE_METERING_FREEZE_VERSION,
  PRODUCT_USAGE_METERING_ID,
  PRODUCT_USAGE_METERING_VERSION,
  RATING_RESULTS,
} from "../usage/usage.constants";

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

export const PRODUCT_METERING_SIGNOFF_VERSION =
  "product-metering-signoff-1" as const;

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
  clearUsageMeteringLayer();
}

export function checkProductMeteringReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "MET-CONSTANTS",
      "usage",
      "Product usage metering version constants",
      PRODUCT_USAGE_METERING_ID ===
        "enterprise-product-usage-metering-v1" &&
        PRODUCT_USAGE_METERING_VERSION === "product-metering-1" &&
        PRODUCT_USAGE_METERING_BASE === PRODUCT_INVOICE_ENGINE_ID &&
        PRODUCT_USAGE_METERING_FREEZE_VERSION ===
          "product-usage-metering-freeze-1" &&
        PRODUCT_METERING_FREEZE_VERSION ===
          "product-usage-metering-freeze-1" &&
        METER_UNITS.length === 4 &&
        METER_STATUSES.length === 3 &&
        AGGREGATION_WINDOWS.length === 3 &&
        RATING_RESULTS.length === 3 &&
        METERING_READINESS_VERDICTS.length === 3 &&
        METERING_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_USAGE_METERING_ID} base=${PRODUCT_USAGE_METERING_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "MET-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "MET-INV-BASE",
      "product-invoice",
      "Invoice engine BASE preserved",
      PRODUCT_USAGE_METERING_BASE ===
        "enterprise-product-invoice-engine-v1" &&
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
      `base=${PRODUCT_USAGE_METERING_BASE}`,
    ),
  );

  checks.push(
    check(
      "MET-UPSTREAM",
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
    const mgr = createMeteringManager({ managerId: "prod-met-gate" });
    mgr.initialize();
    mgr.start();

    const meter = mgr.registerMeter({
      id: "met.gate.mtr",
      code: "API-CALLS",
      name: "API Calls",
      unit: "COUNT",
    });
    mgr.recordUsageEvent({
      id: "met.gate.evt1",
      meterId: meter.id,
      accountId: "bil.gate.acc",
      quantity: 100,
    });
    mgr.recordUsageEvent({
      id: "met.gate.evt2",
      meterId: meter.id,
      accountId: "bil.gate.acc",
      quantity: 50,
    });
    const aggregate = mgr.aggregateUsage({
      id: "met.gate.agg",
      meterId: meter.id,
      accountId: "bil.gate.acc",
      window: "DAILY",
    });
    const rating = mgr.rateUsage({
      id: "met.gate.rat",
      aggregateId: aggregate.id,
      unitRateCents: 2,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getMeteringRegistryManifest();

    const ok =
      aggregate.totalQuantity === 150 &&
      rating.result === "RATED" &&
      rating.amountCents === 300 &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_USAGE_METERING_ID &&
      registry.base === PRODUCT_USAGE_METERING_BASE &&
      registry.meterCount >= 1 &&
      registry.eventCount >= 2 &&
      registry.aggregateCount >= 1 &&
      registry.ratingCount >= 1;

    try {
      assertUsageMeteringReadinessReady(readiness);
      checks.push(
        check(
          "MET-STACK",
          "usage",
          "Meter / event / aggregate / rating",
          ok,
          `readiness=${readiness.verdict} amount=${rating.amountCents}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "MET-STACK",
          "usage",
          "Meter / event / aggregate / rating",
          false,
          error instanceof Error
            ? error.message
            : "product metering not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "MET-STACK",
        "usage",
        "Meter / event / aggregate / rating",
        false,
        error instanceof Error
          ? error.message
          : "product metering probe failed",
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
      `product-metering-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductMeteringReleaseGatePass(
  gate: ReleaseGateResult = checkProductMeteringReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product metering release gate failed: ${gate.summary}`,
    );
  }
}
