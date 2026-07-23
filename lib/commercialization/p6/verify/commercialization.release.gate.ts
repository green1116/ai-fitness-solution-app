/**
 * Commercialization P6 — Revenue Intelligence Release Gate
 * BASE: enterprise-commercialization-p5-delivery-operations-foundation-v1
 * Isolated namespace — does not mutate E01–E12 or P1–P5 layers
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../../product/e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { COMMERCIALIZATION_SALES_FOUNDATION_ID } from "../../p1/sales/sales.constants";
import { COMMERCIALIZATION_PRODUCT_PACKAGING_ID } from "../../p2/tier/tier.constants";
import { COMMERCIALIZATION_PRICING_CONTRACT_ID } from "../../p3/pricing/pricing.constants";
import { COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID } from "../../p4/onboarding/onboarding.constants";
import {
  COMMERCIALIZATION_DELIVERY_OPERATIONS_ID,
  COMMERCIALIZATION_P5_DELIVERY_FREEZE_VERSION,
} from "../../p5/delivery/delivery.constants";
import {
  COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION,
  HEALTH_BANDS,
  KPI_CATEGORIES,
  REPORT_KINDS,
  REVENUE_MANAGER_STATUSES,
  REVENUE_PERIODS,
  REVENUE_READINESS_VERDICTS,
  REVENUE_STREAM_KINDS,
} from "../kpi/kpi.constants";
import {
  assertRevenueIntelligenceReadinessReady,
  clearRevenueIntelligenceLayer,
  createRevenueIntelligenceManager,
  getRevenueRegistryManifest,
} from "../revenue.manager";

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

export const COMMERCIALIZATION_P6_SIGNOFF_VERSION =
  "commercialization-p6-signoff-1" as const;

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
  clearRevenueIntelligenceLayer();
}

export function checkCommercializationP6ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "COM-P6-CONSTANTS",
      "revenue",
      "Revenue intelligence version constants",
      COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID ===
        "enterprise-commercialization-p6-revenue-intelligence-v1" &&
        COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION ===
          "commercialization-p6-1" &&
        COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE ===
          COMMERCIALIZATION_DELIVERY_OPERATIONS_ID &&
        COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE ===
          "enterprise-commercialization-p5-delivery-operations-foundation-v1" &&
        COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION ===
          "commercialization-revenue-intelligence-freeze-1" &&
        COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION ===
          "commercialization-p6-revenue-intelligence-freeze-1" &&
        REVENUE_STREAM_KINDS.length === 4 &&
        REVENUE_PERIODS.length === 3 &&
        KPI_CATEGORIES.length === 4 &&
        HEALTH_BANDS.length === 5 &&
        REPORT_KINDS.length === 4 &&
        REVENUE_READINESS_VERDICTS.length === 3 &&
        REVENUE_MANAGER_STATUSES.length === 4,
      `id=${COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID} base=${COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "COM-P6-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "COM-P6-P5-BASE",
      "delivery-ops",
      "P5 delivery-ops freeze preserved as BASE",
      COMMERCIALIZATION_DELIVERY_OPERATIONS_ID ===
        "enterprise-commercialization-p5-delivery-operations-foundation-v1" &&
        COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE ===
          COMMERCIALIZATION_DELIVERY_OPERATIONS_ID &&
        COMMERCIALIZATION_P5_DELIVERY_FREEZE_VERSION ===
          "commercialization-p5-delivery-operations-foundation-freeze-1" &&
        COMMERCIALIZATION_CUSTOMER_ONBOARDING_ID ===
          "enterprise-commercialization-p4-customer-onboarding-foundation-v1" &&
        COMMERCIALIZATION_PRICING_CONTRACT_ID ===
          "enterprise-commercialization-p3-pricing-contract-foundation-v1" &&
        COMMERCIALIZATION_PRODUCT_PACKAGING_ID ===
          "enterprise-commercialization-p2-product-packaging-foundation-v1" &&
        COMMERCIALIZATION_SALES_FOUNDATION_ID ===
          "enterprise-commercialization-p1-sales-foundation-v1",
      `p5=${COMMERCIALIZATION_DELIVERY_OPERATIONS_ID}`,
    ),
  );

  checks.push(
    check(
      "COM-P6-UPSTREAM",
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
    const mgr = createRevenueIntelligenceManager({
      managerId: "comm-p6-gate",
    });
    mgr.initialize();
    mgr.start();

    mgr.registerStream({
      id: "comm.p6.gate.sub",
      name: "Acme Subscription",
      accountRef: "acme-fitness",
      kind: "SUBSCRIPTION",
      amount: 12000,
      period: "ANNUAL",
    });
    mgr.registerStream({
      id: "comm.p6.gate.svc",
      name: "Acme Onboarding Services",
      accountRef: "acme-fitness",
      kind: "SERVICES",
      amount: 4000,
      period: "ANNUAL",
    });

    const metrics = mgr.computeMetrics({
      id: "comm.p6.gate.metrics",
      accountRef: "acme-fitness",
    });
    const analytics = mgr.runAnalytics({
      id: "comm.p6.gate.analytics",
      accountRef: "acme-fitness",
    });
    mgr.calculateAnalytics({
      id: "comm.p6.gate.calc",
      analyticsId: analytics.id,
      formula: "GROWTH",
    });

    mgr.registerKpi({
      id: "comm.p6.gate.kpi",
      name: "ARR Target",
      category: "GROWTH",
      target: 20000,
      actual: 16000,
      unit: "USD",
    });

    mgr.captureValue({
      id: "comm.p6.gate.value",
      accountRef: "acme-fitness",
      lifetimeValue: 48000,
      expansionPotential: 12000,
    });
    mgr.assessHealth({
      id: "comm.p6.gate.health",
      accountRef: "acme-fitness",
      engagementScore: 82,
      supportLoad: 15,
    });
    const score = mgr.scoreCustomer({
      id: "comm.p6.gate.score",
      accountRef: "acme-fitness",
    });

    const report = mgr.generateReport({
      id: "comm.p6.gate.report",
      kind: "EXECUTIVE",
      title: "Acme Revenue Intelligence",
      accountRef: "acme-fitness",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getRevenueRegistryManifest();

    const ok =
      metrics.totalRevenue >= 16000 &&
      score.compositeScore >= 40 &&
      report.overallScore >= 0 &&
      readiness.verdict === "READY" &&
      registry.foundationId === COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID &&
      registry.base === COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE &&
      registry.streamCount >= 2 &&
      registry.metricsCount >= 1 &&
      registry.analyticsCount >= 1 &&
      registry.calculationCount >= 1 &&
      registry.kpiCount >= 1 &&
      registry.valueCount >= 1 &&
      registry.healthCount >= 1 &&
      registry.scoreCount >= 1 &&
      registry.reportCount >= 1;

    try {
      assertRevenueIntelligenceReadinessReady(readiness);
      checks.push(
        check(
          "COM-P6-STACK",
          "revenue",
          "Revenue / analytics / kpi / customer / report / readiness",
          ok,
          `total=${metrics.totalRevenue} score=${score.compositeScore} readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "COM-P6-STACK",
          "revenue",
          "Revenue / analytics / kpi / customer / report / readiness",
          false,
          error instanceof Error
            ? error.message
            : "revenue intelligence not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "COM-P6-STACK",
        "revenue",
        "Revenue / analytics / kpi / customer / report / readiness",
        false,
        error instanceof Error
          ? error.message
          : "revenue intelligence probe failed",
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
      `commercialization-p6-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertCommercializationP6ReleaseGatePass(
  gate: ReleaseGateResult = checkCommercializationP6ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Commercialization P6 release gate failed: ${gate.summary}`,
    );
  }
}
