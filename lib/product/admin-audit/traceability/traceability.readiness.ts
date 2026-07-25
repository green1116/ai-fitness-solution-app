/**
 * Product Admin Audit — readiness
 */

import { PRODUCT_COMPLIANCE_GOVERNANCE_ID } from "../../compliance/governance/governance.constants";
import { listAdminAuditEvents } from "../event/event.registry";
import { listAdminSeals } from "../integrity/integrity.registry";
import { listAdminAuditQueries } from "../query/query.registry";
import { listAdminTrails } from "../trail/trail.registry";
import { PRODUCT_ADMIN_AUDIT_BASE } from "./traceability.constants";
import type {
  AdminAuditReadinessCheck,
  AdminAuditReadinessResult,
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
): AdminAuditReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateAdminAuditReadiness(): AdminAuditReadinessResult {
  const checks: AdminAuditReadinessCheck[] = [];

  checks.push(
    check(
      "ADA-BASE",
      "foundation",
      "Compliance governance baseline aligned",
      PRODUCT_ADMIN_AUDIT_BASE === PRODUCT_COMPLIANCE_GOVERNANCE_ID,
      `base=${PRODUCT_ADMIN_AUDIT_BASE}`,
    ),
  );

  const events = listAdminAuditEvents();
  checks.push(
    check(
      "ADA-EVT",
      "event",
      "Admin audit events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  const trails = listAdminTrails();
  checks.push(
    check(
      "ADA-TRL",
      "trail",
      "Admin audit trails present",
      trails.some((t) => t.status === "SEALED" || t.status === "RECORDED"),
      `trails=${trails.length}`,
    ),
  );

  const seals = listAdminSeals();
  checks.push(
    check(
      "ADA-SEL",
      "integrity",
      "Intact seals present",
      seals.some((s) => s.result === "INTACT"),
      `seals=${seals.length}`,
    ),
  );

  const queries = listAdminAuditQueries();
  checks.push(
    check(
      "ADA-QRY",
      "query",
      "Admin audit queries present",
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
    summary: `product-admin-audit readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAdminAuditReadinessReady(
  result: AdminAuditReadinessResult,
): asserts result is AdminAuditReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product admin audit not ready: ${result.summary}`);
  }
}
