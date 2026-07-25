/**
 * Product Audit — readiness
 */

import { PRODUCT_SSO_FEDERATION_ID } from "../../sso/federation/federation.constants";
import { listAuditEvents } from "../event/event.registry";
import { listSeals } from "../integrity/integrity.registry";
import { listAuditQueries } from "../query/query.registry";
import { listTrails } from "../trail/trail.registry";
import { PRODUCT_AUDIT_TRACEABILITY_BASE } from "./security.constants";
import type {
  AuditReadinessCheck,
  AuditReadinessResult,
} from "./security.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AuditReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateAuditTraceabilityReadiness(): AuditReadinessResult {
  const checks: AuditReadinessCheck[] = [];

  checks.push(
    check(
      "AUD-BASE",
      "foundation",
      "SSO federation baseline aligned",
      PRODUCT_AUDIT_TRACEABILITY_BASE === PRODUCT_SSO_FEDERATION_ID,
      `base=${PRODUCT_AUDIT_TRACEABILITY_BASE}`,
    ),
  );

  const events = listAuditEvents();
  checks.push(
    check(
      "AUD-EVT",
      "event",
      "Security audit events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  const trails = listTrails();
  checks.push(
    check(
      "AUD-TRL",
      "trail",
      "Audit trail entries present",
      trails.some((t) => t.status === "SEALED" || t.status === "RECORDED"),
      `trails=${trails.length}`,
    ),
  );

  const seals = listSeals();
  checks.push(
    check(
      "AUD-SEL",
      "integrity",
      "Intact seals present",
      seals.some((s) => s.result === "INTACT"),
      `seals=${seals.length}`,
    ),
  );

  const queries = listAuditQueries();
  checks.push(
    check(
      "AUD-QRY",
      "query",
      "Audit queries present",
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
    summary: `product-audit readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAuditTraceabilityReadinessReady(
  result: AuditReadinessResult,
): asserts result is AuditReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product audit traceability not ready: ${result.summary}`,
    );
  }
}
