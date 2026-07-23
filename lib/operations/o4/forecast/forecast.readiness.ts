/**
 * Operations O4 — Growth analytics readiness
 */

import { OPERATIONS_O3_SUPPORT_OPERATIONS_ID } from "../../o3/ticket/ticket.constants";
import { listCohortAnalyses } from "../cohort/cohort.analysis";
import { listCohortReports } from "../cohort/cohort.report";
import { listExpansionOpportunities } from "../expansion/expansion.opportunity";
import { listExpansionSignals } from "../expansion/expansion.signal";
import { OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE } from "../growth/growth.constants";
import { listGrowthMetrics } from "../growth/growth.metrics";
import { listGrowthTracking } from "../growth/growth.tracker";
import { listRetentionAnalyses } from "../retention/retention.analysis";
import { listRetentionScores } from "../retention/retention.score";
import { listForecastModels } from "./forecast.model";
import { listForecastPredictions } from "./forecast.prediction";
import type { O4ReadinessCheck, O4ReadinessResult } from "./forecast.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): O4ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateO4GrowthAnalyticsReadiness(): O4ReadinessResult {
  const checks: O4ReadinessCheck[] = [];

  checks.push(
    check(
      "O4-BASE",
      "foundation",
      "O3 support operations baseline aligned",
      OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE ===
        OPERATIONS_O3_SUPPORT_OPERATIONS_ID,
      `base=${OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE}`,
    ),
  );

  const growthMetrics = listGrowthMetrics();
  checks.push(
    check(
      "O4-GMET",
      "growth",
      "Growth metrics present",
      growthMetrics.length >= 1,
      `growthMetrics=${growthMetrics.length}`,
    ),
  );

  const growthTracking = listGrowthTracking();
  checks.push(
    check(
      "O4-GTRK",
      "growth",
      "Growth tracking present",
      growthTracking.length >= 1,
      `growthTracking=${growthTracking.length}`,
    ),
  );

  const retentionScores = listRetentionScores();
  checks.push(
    check(
      "O4-RSC",
      "retention",
      "Retention scores present",
      retentionScores.length >= 1,
      `retentionScores=${retentionScores.length}`,
    ),
  );

  const retentionAnalyses = listRetentionAnalyses();
  checks.push(
    check(
      "O4-RAN",
      "retention",
      "Retention analyses present",
      retentionAnalyses.length >= 1,
      `retentionAnalyses=${retentionAnalyses.length}`,
    ),
  );

  const signals = listExpansionSignals();
  checks.push(
    check(
      "O4-SIG",
      "expansion",
      "Expansion signals present",
      signals.length >= 1,
      `signals=${signals.length}`,
    ),
  );

  const opportunities = listExpansionOpportunities();
  checks.push(
    check(
      "O4-OPP",
      "expansion",
      "Expansion opportunities present",
      opportunities.length >= 1,
      `opportunities=${opportunities.length}`,
    ),
  );

  const cohorts = listCohortAnalyses();
  checks.push(
    check(
      "O4-COH",
      "cohort",
      "Cohort analyses present",
      cohorts.length >= 1,
      `cohorts=${cohorts.length}`,
    ),
  );

  const cohortReports = listCohortReports();
  checks.push(
    check(
      "O4-CREP",
      "cohort",
      "Cohort reports present",
      cohortReports.length >= 1,
      `cohortReports=${cohortReports.length}`,
    ),
  );

  const models = listForecastModels();
  checks.push(
    check(
      "O4-FMOD",
      "forecast",
      "Forecast models present",
      models.length >= 1,
      `models=${models.length}`,
    ),
  );

  const predictions = listForecastPredictions();
  checks.push(
    check(
      "O4-FPRD",
      "forecast",
      "Forecast predictions present",
      predictions.length >= 1,
      `predictions=${predictions.length}`,
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
    summary: `o4-growth-analytics-foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertO4GrowthAnalyticsReadinessReady(
  result: O4ReadinessResult,
): asserts result is O4ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `o4 growth analytics foundation not ready: ${result.summary}`,
    );
  }
}
