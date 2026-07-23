/**
 * Operations O1 — Customer success foundation readiness
 */

import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { listCustomers } from "../customer/customer.registry";
import { listFeedbackAnalyses } from "../feedback/feedback.analysis";
import { listFeedbackEntries } from "../feedback/feedback.collector";
import { listHealthMetrics } from "../health/health.metrics";
import { listHealthScores } from "../health/health.score";
import { OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE } from "../success/success.constants";
import { listSuccessPlans } from "../success/success.plan";
import { listSuccessTracking } from "../success/success.tracking";
import { listRenewals } from "./renewal.status";
import type { O1ReadinessCheck, O1ReadinessResult } from "./renewal.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): O1ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateO1CustomerSuccessReadiness(): O1ReadinessResult {
  const checks: O1ReadinessCheck[] = [];

  checks.push(
    check(
      "O1-BASE",
      "foundation",
      "Launch v1 release baseline aligned",
      OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE ===
        "enterprise-launch-v1-release" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1",
      `base=${OPERATIONS_O1_CUSTOMER_SUCCESS_FOUNDATION_BASE}`,
    ),
  );

  const customers = listCustomers();
  checks.push(
    check(
      "O1-CUS",
      "customer",
      "Customers registered",
      customers.length >= 1,
      `customers=${customers.length}`,
    ),
  );

  const metrics = listHealthMetrics();
  checks.push(
    check(
      "O1-MET",
      "health",
      "Health metrics present",
      metrics.length >= 1,
      `metrics=${metrics.length}`,
    ),
  );

  const scores = listHealthScores();
  checks.push(
    check(
      "O1-HLT",
      "health",
      "Health scores present",
      scores.length >= 1,
      `scores=${scores.length}`,
    ),
  );

  const plans = listSuccessPlans();
  checks.push(
    check(
      "O1-PLN",
      "success",
      "Success plans present",
      plans.length >= 1,
      `plans=${plans.length}`,
    ),
  );

  const tracking = listSuccessTracking();
  checks.push(
    check(
      "O1-TRK",
      "success",
      "Success tracking present",
      tracking.length >= 1,
      `tracking=${tracking.length}`,
    ),
  );

  const feedback = listFeedbackEntries();
  checks.push(
    check(
      "O1-FBK",
      "feedback",
      "Feedback entries present",
      feedback.length >= 1,
      `feedback=${feedback.length}`,
    ),
  );

  const analyses = listFeedbackAnalyses();
  checks.push(
    check(
      "O1-ANL",
      "feedback",
      "Feedback analyses present",
      analyses.length >= 1,
      `analyses=${analyses.length}`,
    ),
  );

  const renewals = listRenewals();
  checks.push(
    check(
      "O1-RNW",
      "renewal",
      "Renewals present",
      renewals.length >= 1,
      `renewals=${renewals.length}`,
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
    summary: `o1-customer-success-foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertO1CustomerSuccessReadinessReady(
  result: O1ReadinessResult,
): asserts result is O1ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `o1 customer success foundation not ready: ${result.summary}`,
    );
  }
}
