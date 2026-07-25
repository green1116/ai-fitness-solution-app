/**
 * Product Billing Audit — readiness
 */

import { PRODUCT_PAYMENT_INTEGRATION_ID } from "../../payment/integration/integration.constants";
import { listBillingAuditEvents } from "../event/event.registry";
import { listBillingSeals } from "../integrity/integrity.registry";
import { listBillingAuditQueries } from "../query/query.registry";
import { listBillingTrails } from "../trail/trail.registry";
import { PRODUCT_BILLING_AUDIT_BASE } from "./traceability.constants";
import type {
  BillingAuditReadinessCheck,
  BillingAuditReadinessResult,
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
): BillingAuditReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateBillingAuditReadiness(): BillingAuditReadinessResult {
  const checks: BillingAuditReadinessCheck[] = [];

  checks.push(
    check(
      "BAU-BASE",
      "foundation",
      "Payment integration baseline aligned",
      PRODUCT_BILLING_AUDIT_BASE === PRODUCT_PAYMENT_INTEGRATION_ID,
      `base=${PRODUCT_BILLING_AUDIT_BASE}`,
    ),
  );

  const events = listBillingAuditEvents();
  checks.push(
    check(
      "BAU-EVT",
      "event",
      "Billing audit events present",
      events.length >= 1,
      `events=${events.length}`,
    ),
  );

  const trails = listBillingTrails();
  checks.push(
    check(
      "BAU-TRL",
      "trail",
      "Billing audit trails present",
      trails.some((t) => t.status === "SEALED" || t.status === "RECORDED"),
      `trails=${trails.length}`,
    ),
  );

  const seals = listBillingSeals();
  checks.push(
    check(
      "BAU-SEL",
      "integrity",
      "Intact seals present",
      seals.some((s) => s.result === "INTACT"),
      `seals=${seals.length}`,
    ),
  );

  const queries = listBillingAuditQueries();
  checks.push(
    check(
      "BAU-QRY",
      "query",
      "Billing audit queries present",
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
    summary: `product-billing-audit readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertBillingAuditReadinessReady(
  result: BillingAuditReadinessResult,
): asserts result is BillingAuditReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product billing audit not ready: ${result.summary}`,
    );
  }
}
