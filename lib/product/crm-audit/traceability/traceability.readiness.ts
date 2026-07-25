/**
 * Product CRM Audit — readiness
 */

import { PRODUCT_CUSTOMER_INSIGHT_ID } from "../../customer-insight/insight/insight.constants";
import { listCrmAuditEvents } from "../event/event.registry";
import { listCrmSeals } from "../integrity/integrity.registry";
import { listCrmAuditQueries } from "../query/query.registry";
import { listCrmTrails } from "../trail/trail.registry";
import { PRODUCT_CRM_AUDIT_BASE } from "./traceability.constants";
import type {
  CrmAuditReadinessCheck,
  CrmAuditReadinessResult,
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
): CrmAuditReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateCrmAuditReadiness(): CrmAuditReadinessResult {
  const checks: CrmAuditReadinessCheck[] = [];

  checks.push(
    check(
      "CRAU-BASE",
      "foundation",
      "Customer insight baseline aligned",
      PRODUCT_CRM_AUDIT_BASE === PRODUCT_CUSTOMER_INSIGHT_ID,
      `base=${PRODUCT_CRM_AUDIT_BASE}`,
    ),
  );

  const events = listCrmAuditEvents();
  checks.push(
    check(
      "CRAU-EVT",
      "event",
      "CRM audit events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  const trails = listCrmTrails();
  checks.push(
    check(
      "CRAU-TRL",
      "trail",
      "CRM audit trails present",
      trails.some((t) => t.status === "SEALED" || t.status === "RECORDED"),
      `trails=${trails.length}`,
    ),
  );

  const seals = listCrmSeals();
  checks.push(
    check(
      "CRAU-SEL",
      "integrity",
      "Intact seals present",
      seals.some((s) => s.result === "INTACT"),
      `seals=${seals.length}`,
    ),
  );

  const queries = listCrmAuditQueries();
  checks.push(
    check(
      "CRAU-QRY",
      "query",
      "CRM audit queries present",
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
    summary: `product-crm-audit readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertCrmAuditReadinessReady(
  result: CrmAuditReadinessResult,
): asserts result is CrmAuditReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product crm audit not ready: ${result.summary}`);
  }
}
