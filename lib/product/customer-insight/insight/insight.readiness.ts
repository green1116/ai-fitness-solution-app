/**
 * Product Customer Insight — readiness
 */

import { PRODUCT_CUSTOMER_ACTIVITY_ID } from "../../customer-activity/activity/activity.constants";
import { listRecommendations } from "../recommendation/recommendation.registry";
import { listScores } from "../score/score.registry";
import { listInsightSegments } from "../segment/segment.registry";
import { listSignals } from "../signal/signal.registry";
import { PRODUCT_CUSTOMER_INSIGHT_BASE } from "./insight.constants";
import type {
  CustomerInsightReadinessCheck,
  CustomerInsightReadinessResult,
} from "./insight.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): CustomerInsightReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateCustomerInsightReadiness(): CustomerInsightReadinessResult {
  const checks: CustomerInsightReadinessCheck[] = [];

  checks.push(
    check(
      "CINS-BASE",
      "insight",
      "Customer activity aligned",
      PRODUCT_CUSTOMER_INSIGHT_BASE === PRODUCT_CUSTOMER_ACTIVITY_ID,
      `base=${PRODUCT_CUSTOMER_INSIGHT_BASE}`,
    ),
  );

  const signals = listSignals();
  checks.push(
    check(
      "CINS-SIG",
      "signal",
      "Insight signals present",
      signals.length >= 1,
      `signals=${signals.length}`,
    ),
  );

  const scores = listScores();
  checks.push(
    check(
      "CINS-SCR",
      "score",
      "Health scores present",
      scores.some((s) => s.kind === "HEALTH"),
      `scores=${scores.length}`,
    ),
  );

  const segments = listInsightSegments();
  checks.push(
    check(
      "CINS-SEG",
      "segment",
      "Insight segments present",
      segments.length >= 1,
      `segments=${segments.length}`,
    ),
  );

  const recommendations = listRecommendations();
  checks.push(
    check(
      "CINS-REC",
      "recommendation",
      "Recommendations present",
      recommendations.length >= 1,
      `recommendations=${recommendations.length}`,
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
    summary: `product-customer-insight readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertCustomerInsightReadinessReady(
  result: CustomerInsightReadinessResult,
): asserts result is CustomerInsightReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product customer insight not ready: ${result.summary}`,
    );
  }
}
