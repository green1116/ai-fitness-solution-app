/**
 * Commercialization P6 — Revenue intelligence readiness
 */

import { COMMERCIALIZATION_DELIVERY_OPERATIONS_ID } from "../../p5/delivery/delivery.constants";
import { listAnalyticsCalculations } from "../analytics/analytics.calculator";
import { listAnalyticsSnapshots } from "../analytics/analytics.engine";
import { listCustomerHealthProfiles } from "../customer/customer.health";
import { listCustomerScoreCards } from "../customer/customer.score";
import { listCustomerValueProfiles } from "../customer/customer.value";
import { COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE } from "../kpi/kpi.constants";
import { listRevenueKpis } from "../kpi/kpi.registry";
import { listRevenueReports } from "./report.generator";
import { listRevenueMetrics } from "../revenue/revenue.metrics";
import { listRevenueStreams } from "../revenue/revenue.registry";
import type {
  RevenueReadinessCheck,
  RevenueReadinessResult,
} from "./report.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): RevenueReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateRevenueIntelligenceReadiness(): RevenueReadinessResult {
  const checks: RevenueReadinessCheck[] = [];

  checks.push(
    check(
      "COM-P6-BASE",
      "foundation",
      "P5 delivery-ops baseline aligned",
      COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE ===
        COMMERCIALIZATION_DELIVERY_OPERATIONS_ID,
      `base=${COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE}`,
    ),
  );

  const streams = listRevenueStreams();
  checks.push(
    check(
      "COM-P6-REV",
      "revenue",
      "Revenue streams registered",
      streams.length >= 1,
      `streams=${streams.length}`,
    ),
  );

  const metrics = listRevenueMetrics();
  checks.push(
    check(
      "COM-P6-MET",
      "revenue",
      "Revenue metrics computed",
      metrics.length >= 1,
      `metrics=${metrics.length}`,
    ),
  );

  const analytics = listAnalyticsSnapshots();
  checks.push(
    check(
      "COM-P6-ANL",
      "analytics",
      "Analytics snapshots present",
      analytics.length >= 1,
      `analytics=${analytics.length}`,
    ),
  );

  const calcs = listAnalyticsCalculations();
  checks.push(
    check(
      "COM-P6-CALC",
      "analytics",
      "Analytics calculations present",
      calcs.length >= 1,
      `calculations=${calcs.length}`,
    ),
  );

  const kpis = listRevenueKpis();
  checks.push(
    check(
      "COM-P6-KPI",
      "kpi",
      "KPIs registered",
      kpis.length >= 1,
      `kpis=${kpis.length}`,
    ),
  );

  const values = listCustomerValueProfiles();
  checks.push(
    check(
      "COM-P6-VAL",
      "customer",
      "Customer value profiles present",
      values.length >= 1,
      `values=${values.length}`,
    ),
  );

  const health = listCustomerHealthProfiles();
  checks.push(
    check(
      "COM-P6-HEALTH",
      "customer",
      "Customer health profiles present",
      health.length >= 1,
      `health=${health.length}`,
    ),
  );

  const scores = listCustomerScoreCards();
  checks.push(
    check(
      "COM-P6-SCORE",
      "customer",
      "Customer score cards present",
      scores.length >= 1,
      `scores=${scores.length}`,
    ),
  );

  const reports = listRevenueReports();
  checks.push(
    check(
      "COM-P6-REP",
      "report",
      "Revenue reports generated",
      reports.length >= 1,
      `reports=${reports.length}`,
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
    summary: `revenue-intelligence readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertRevenueIntelligenceReadinessReady(
  result: RevenueReadinessResult,
): asserts result is RevenueReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `revenue intelligence foundation not ready: ${result.summary}`,
    );
  }
}
