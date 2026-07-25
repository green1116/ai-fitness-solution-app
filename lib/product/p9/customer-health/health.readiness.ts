/**
 * Product P9 — Customer Success readiness
 */

import { PRODUCT_P8_TENDER_DELIVERY_ID } from "../../p8/tender/tender.constants";
import { listExpansions } from "../expansion/expansion.registry";
import { listFeedback } from "../feedback/feedback.registry";
import { listRenewals } from "../renewal/renewal.registry";
import { listSatisfaction } from "../satisfaction/satisfaction.registry";
import { listSuccessPlans } from "../success-plan/plan.registry";
import { listUsage } from "../usage/usage.registry";
import { PRODUCT_P9_CUSTOMER_SUCCESS_BASE } from "./health.constants";
import { listCustomerHealth } from "./health.registry";
import type { P9ReadinessCheck, P9ReadinessResult } from "./health.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): P9ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateP9CustomerSuccessReadiness(): P9ReadinessResult {
  const checks: P9ReadinessCheck[] = [];

  checks.push(
    check(
      "P9-BASE",
      "foundation",
      "P8 tender delivery baseline aligned",
      PRODUCT_P9_CUSTOMER_SUCCESS_BASE === PRODUCT_P8_TENDER_DELIVERY_ID,
      `base=${PRODUCT_P9_CUSTOMER_SUCCESS_BASE}`,
    ),
  );

  const health = listCustomerHealth();
  checks.push(
    check(
      "P9-HLT",
      "customer-health",
      "Customer health present",
      health.length >= 1,
      `health=${health.length}`,
    ),
  );

  const usage = listUsage();
  checks.push(
    check(
      "P9-USG",
      "usage",
      "Usage snapshots present",
      usage.length >= 1,
      `usage=${usage.length}`,
    ),
  );

  const feedback = listFeedback();
  checks.push(
    check(
      "P9-FBK",
      "feedback",
      "Feedback present",
      feedback.length >= 1,
      `feedback=${feedback.length}`,
    ),
  );

  const satisfaction = listSatisfaction();
  checks.push(
    check(
      "P9-SAT",
      "satisfaction",
      "Satisfaction scores present",
      satisfaction.length >= 1,
      `satisfaction=${satisfaction.length}`,
    ),
  );

  const plans = listSuccessPlans();
  checks.push(
    check(
      "P9-PLN",
      "success-plan",
      "Success plans active",
      plans.some(
        (p) =>
          p.status === "ACTIVE" ||
          p.status === "ON_TRACK" ||
          p.status === "COMPLETE",
      ),
      `plans=${plans.length}`,
    ),
  );

  const renewals = listRenewals();
  checks.push(
    check(
      "P9-RNW",
      "renewal",
      "Renewals advanced",
      renewals.some(
        (r) =>
          r.status === "IN_DISCUSSION" ||
          r.status === "COMMITTED" ||
          r.status === "RENEWED",
      ),
      `renewals=${renewals.length}`,
    ),
  );

  const expansions = listExpansions();
  checks.push(
    check(
      "P9-EXP",
      "expansion",
      "Expansions present",
      expansions.length >= 1,
      `expansions=${expansions.length}`,
    ),
  );

  const healthyOrWatch = health.some(
    (h) => h.status === "HEALTHY" || h.status === "WATCH",
  );
  checks.push(
    check(
      "P9-LIFE",
      "customer-health",
      "Health status monitored",
      healthyOrWatch,
      `monitored=${healthyOrWatch}`,
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
    summary: `p9-customer-success readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertP9CustomerSuccessReadinessReady(
  result: P9ReadinessResult,
): asserts result is P9ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`p9 customer success not ready: ${result.summary}`);
  }
}
