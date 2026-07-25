/**
 * Product KPI — KPI Management Release Gate
 * MODULE: KPI
 * BASE: enterprise-product-analytics-foundation-v1
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
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../../billing-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../../customer-baseline/freeze/freeze.lock";
import { PRODUCT_ANALYTICS_FOUNDATION_ID } from "../../analytics/foundation/foundation.constants";
import {
  assertKpiManagementReadinessReady,
  clearKpiManagementLayer,
  createKpiManager,
  getKpiRegistryManifest,
} from "../kpi.manager";
import {
  KPI_CATEGORIES,
  KPI_MANAGER_STATUSES,
  KPI_READINESS_VERDICTS,
  KPI_STATUSES,
  MEASUREMENT_RESULTS,
  PRODUCT_KPI_FREEZE_VERSION,
  PRODUCT_KPI_MANAGEMENT_BASE,
  PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_KPI_MANAGEMENT_ID,
  PRODUCT_KPI_MANAGEMENT_VERSION,
  TARGET_PERIODS,
} from "../management/management.constants";

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

export const PRODUCT_KPI_SIGNOFF_VERSION =
  "product-kpi-signoff-1" as const;

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
  clearKpiManagementLayer();
}

export function checkProductKpiReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "KPI-CONSTANTS",
      "management",
      "Product KPI management version constants",
      PRODUCT_KPI_MANAGEMENT_ID ===
        "enterprise-product-kpi-management-v1" &&
        PRODUCT_KPI_MANAGEMENT_VERSION === "product-kpi-1" &&
        PRODUCT_KPI_MANAGEMENT_BASE === PRODUCT_ANALYTICS_FOUNDATION_ID &&
        PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION ===
          "product-kpi-management-freeze-1" &&
        PRODUCT_KPI_FREEZE_VERSION === "product-kpi-management-freeze-1" &&
        KPI_CATEGORIES.length === 4 &&
        KPI_STATUSES.length === 3 &&
        TARGET_PERIODS.length === 3 &&
        MEASUREMENT_RESULTS.length === 3 &&
        KPI_READINESS_VERDICTS.length === 3 &&
        KPI_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_KPI_MANAGEMENT_ID} base=${PRODUCT_KPI_MANAGEMENT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "KPI-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "KPI-ANL-BASE",
      "product-analytics-foundation",
      "Analytics foundation BASE preserved",
      PRODUCT_KPI_MANAGEMENT_BASE ===
        "enterprise-product-analytics-foundation-v1" &&
        PRODUCT_ANALYTICS_FOUNDATION_ID ===
          "enterprise-product-analytics-foundation-v1" &&
        ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
          "enterprise-product-customer-baseline-v1" &&
        ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
          "enterprise-product-billing-baseline-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_KPI_MANAGEMENT_BASE}`,
    ),
  );

  checks.push(
    check(
      "KPI-UPSTREAM",
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
    const mgr = createKpiManager({ managerId: "prod-kpi-gate" });
    mgr.initialize();
    mgr.start();

    const kpi = mgr.defineKpi({
      id: "kpi.gate.def",
      code: "NRR",
      name: "Net Revenue Retention",
      category: "REVENUE",
      metricId: "anl.gate.met",
    });
    mgr.updateKpiStatus({ kpiId: kpi.id, status: "ACTIVE" });
    const target = mgr.setKpiTarget({
      id: "kpi.gate.tgt",
      kpiId: kpi.id,
      period: "QUARTERLY",
      value: 100,
    });
    mgr.recordKpiMeasurement({
      id: "kpi.gate.mea",
      kpiId: kpi.id,
      targetId: target.id,
      actual: 105,
    });
    const scorecard = mgr.buildScorecard({
      id: "kpi.gate.sc",
      name: "Q1 Enterprise Scorecard",
      kpiIds: [kpi.id],
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getKpiRegistryManifest();

    const ok =
      scorecard.onTrackCount >= 1 &&
      readiness.verdict === "READY" &&
      registry.managementId === PRODUCT_KPI_MANAGEMENT_ID &&
      registry.base === PRODUCT_KPI_MANAGEMENT_BASE &&
      registry.definitionCount >= 1 &&
      registry.targetCount >= 1 &&
      registry.measurementCount >= 1 &&
      registry.scorecardCount >= 1;

    try {
      assertKpiManagementReadinessReady(readiness);
      checks.push(
        check(
          "KPI-STACK",
          "management",
          "Definition / target / measurement / scorecard",
          ok,
          `readiness=${readiness.verdict} onTrack=${scorecard.onTrackCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "KPI-STACK",
          "management",
          "Definition / target / measurement / scorecard",
          false,
          error instanceof Error
            ? error.message
            : "product kpi not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "KPI-STACK",
        "management",
        "Definition / target / measurement / scorecard",
        false,
        error instanceof Error
          ? error.message
          : "product kpi probe failed",
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
      `product-kpi-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductKpiReleaseGatePass(
  gate: ReleaseGateResult = checkProductKpiReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product KPI release gate failed: ${gate.summary}`);
  }
}
