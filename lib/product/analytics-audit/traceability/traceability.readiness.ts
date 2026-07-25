/**
 * Product Analytics Audit — readiness
 */

import { PRODUCT_BI_INTEGRATION_ID } from "../../bi/integration/integration.constants";
import { listAnalyticsAuditEvents } from "../event/event.registry";
import { listAnalyticsSeals } from "../integrity/integrity.registry";
import { listAnalyticsAuditQueries } from "../query/query.registry";
import { listAnalyticsTrails } from "../trail/trail.registry";
import { PRODUCT_ANALYTICS_AUDIT_BASE } from "./traceability.constants";
import type {
  AnalyticsAuditReadinessCheck,
  AnalyticsAuditReadinessResult,
} from "./traceability.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AnalyticsAuditReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateAnalyticsAuditReadiness(): AnalyticsAuditReadinessResult {
  const checks: AnalyticsAuditReadinessCheck[] = [];

  checks.push(
    check(
      "AAU-BASE",
      "foundation",
      "BI integration baseline aligned",
      PRODUCT_ANALYTICS_AUDIT_BASE === PRODUCT_BI_INTEGRATION_ID,
      `base=${PRODUCT_ANALYTICS_AUDIT_BASE}`,
    ),
  );

  const events = listAnalyticsAuditEvents();
  checks.push(
    check(
      "AAU-EVT",
      "event",
      "Analytics audit events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  const trails = listAnalyticsTrails();
  checks.push(
    check(
      "AAU-TRL",
      "trail",
      "Analytics audit trails present",
      trails.some((t) => t.status === "SEALED" || t.status === "RECORDED"),
      `trails=${trails.length}`,
    ),
  );

  const seals = listAnalyticsSeals();
  checks.push(
    check(
      "AAU-SEL",
      "integrity",
      "Intact seals present",
      seals.some((s) => s.result === "INTACT"),
      `seals=${seals.length}`,
    ),
  );

  const queries = listAnalyticsAuditQueries();
  checks.push(
    check(
      "AAU-QRY",
      "query",
      "Analytics audit queries present",
      queries.some((q) => q.matchCount >= 1),
      `queries=${queries.length}`,
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
    summary: `product-analytics-audit readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAnalyticsAuditReadinessReady(
  result: AnalyticsAuditReadinessResult,
): asserts result is AnalyticsAuditReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product analytics audit not ready: ${result.summary}`,
    );
  }
}
