/**
 * Product Customer Activity — readiness
 */

import { PRODUCT_RELATIONSHIP_MANAGEMENT_ID } from "../../relationship/management/management.constants";
import { listEngagements } from "../engagement/engagement.registry";
import { listActivityEvents } from "../event/event.registry";
import { listActivitySessions } from "../session/session.registry";
import { listTimelineEntries } from "../timeline/timeline.registry";
import { PRODUCT_CUSTOMER_ACTIVITY_BASE } from "./activity.constants";
import type {
  CustomerActivityReadinessCheck,
  CustomerActivityReadinessResult,
} from "./activity.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): CustomerActivityReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateCustomerActivityReadiness(): CustomerActivityReadinessResult {
  const checks: CustomerActivityReadinessCheck[] = [];

  checks.push(
    check(
      "CACT-BASE",
      "activity",
      "Relationship management aligned",
      PRODUCT_CUSTOMER_ACTIVITY_BASE === PRODUCT_RELATIONSHIP_MANAGEMENT_ID,
      `base=${PRODUCT_CUSTOMER_ACTIVITY_BASE}`,
    ),
  );

  const events = listActivityEvents();
  checks.push(
    check(
      "CACT-EV",
      "event",
      "Activity events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  const sessions = listActivitySessions();
  checks.push(
    check(
      "CACT-SS",
      "session",
      "Closed sessions present",
      sessions.some((s) => s.status === "CLOSED"),
      `sessions=${sessions.length}`,
    ),
  );

  const engagements = listEngagements();
  checks.push(
    check(
      "CACT-EG",
      "engagement",
      "High engagements present",
      engagements.some((e) => e.level === "HIGH"),
      `engagements=${engagements.length}`,
    ),
  );

  const timeline = listTimelineEntries();
  checks.push(
    check(
      "CACT-TL",
      "timeline",
      "Timeline entries present",
      timeline.length >= 1,
      `timeline=${timeline.length}`,
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
    summary: `product-customer-activity readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertCustomerActivityReadinessReady(
  result: CustomerActivityReadinessResult,
): asserts result is CustomerActivityReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product customer activity not ready: ${result.summary}`,
    );
  }
}
