/**
 * Operations O2 — Usage intelligence readiness
 */

import { OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID } from "../../o1/success/success.constants";
import { listActivityAnalytics } from "../activity/activity.analytics";
import { listActivityEvents } from "../activity/activity.event";
import { listFeatureAdoptions } from "../feature/feature.adoption";
import { listFeatureMetrics } from "../feature/feature.metrics";
import { OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE } from "../usage/usage.constants";
import { listUsageStreams } from "../usage/usage.registry";
import { listUsageTracking } from "../usage/usage.tracking";
import { listValueMetrics } from "../value/value.metrics";
import { listValueScores } from "../value/value.score";
import { listUsageReports } from "./report.generator";
import type { O2ReadinessCheck, O2ReadinessResult } from "./report.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): O2ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateO2UsageIntelligenceReadiness(): O2ReadinessResult {
  const checks: O2ReadinessCheck[] = [];

  checks.push(
    check(
      "O2-BASE",
      "foundation",
      "O1 customer success foundation baseline aligned",
      OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE ===
        OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_ID,
      `base=${OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE}`,
    ),
  );

  const streams = listUsageStreams();
  checks.push(
    check(
      "O2-USG",
      "usage",
      "Usage streams registered",
      streams.length >= 1,
      `streams=${streams.length}`,
    ),
  );

  const tracking = listUsageTracking();
  checks.push(
    check(
      "O2-TRK",
      "usage",
      "Usage tracking present",
      tracking.length >= 1,
      `tracking=${tracking.length}`,
    ),
  );

  const adoptions = listFeatureAdoptions();
  checks.push(
    check(
      "O2-FAD",
      "feature",
      "Feature adoptions present",
      adoptions.length >= 1,
      `adoptions=${adoptions.length}`,
    ),
  );

  const featureMetrics = listFeatureMetrics();
  checks.push(
    check(
      "O2-FMET",
      "feature",
      "Feature metrics present",
      featureMetrics.length >= 1,
      `featureMetrics=${featureMetrics.length}`,
    ),
  );

  const events = listActivityEvents();
  checks.push(
    check(
      "O2-ACT",
      "activity",
      "Activity events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  const analytics = listActivityAnalytics();
  checks.push(
    check(
      "O2-AAN",
      "activity",
      "Activity analytics present",
      analytics.length >= 1,
      `analytics=${analytics.length}`,
    ),
  );

  const valueMetrics = listValueMetrics();
  checks.push(
    check(
      "O2-VMET",
      "value",
      "Value metrics present",
      valueMetrics.length >= 1,
      `valueMetrics=${valueMetrics.length}`,
    ),
  );

  const valueScores = listValueScores();
  checks.push(
    check(
      "O2-VSC",
      "value",
      "Value scores present",
      valueScores.length >= 1,
      `valueScores=${valueScores.length}`,
    ),
  );

  const reports = listUsageReports();
  checks.push(
    check(
      "O2-REP",
      "report",
      "Usage reports present",
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
    summary: `o2-usage-intelligence-foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertO2UsageIntelligenceReadinessReady(
  result: O2ReadinessResult,
): asserts result is O2ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `o2 usage intelligence foundation not ready: ${result.summary}`,
    );
  }
}
