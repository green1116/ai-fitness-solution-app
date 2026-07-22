/**
 * Post-Launch P3 — Incident Response Readiness
 * Integrates production ops, SLA support, admin audit, customer success
 */

import { listAdminAuditEntries } from "../../product/e12/admin/admin.audit";
import { getSupportSlaProfile } from "../../launch/support/support.profile";
import { getSupportIncident } from "../../launch/support/support.incident";
import { getCustomerHealthProfile } from "../customer-success/success.health";
import { OPERATIONS_CUSTOMER_SUCCESS_ID } from "../customer-success/success.constants";
import { getProductionOperation } from "../production/production.operation";
import { OPERATIONS_INCIDENT_RESPONSE_BASE } from "./incident.constants";
import { listEscalationWorkflows } from "./incident.escalation";
import { computeIncidentMetrics } from "./incident.metrics";
import { getOperationsIncident } from "./incident.model";
import { listIncidentResolutions } from "./incident.resolution";
import type {
  IncidentReadinessCheck,
  IncidentReadinessResult,
} from "./incident.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): IncidentReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateIncidentReadiness(
  operationsIncidentId: string,
): IncidentReadinessResult {
  const incident = getOperationsIncident(operationsIncidentId.trim());
  if (!incident) {
    return {
      operationsIncidentId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "IR-INCIDENT",
          "incident",
          "Operations incident exists",
          false,
          `incident not found: ${operationsIncidentId}`,
        ),
      ],
      summary: "incident readiness not ready: incident missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: IncidentReadinessCheck[] = [];

  checks.push(
    check(
      "IR-BASE",
      "operations",
      "P2 customer success baseline aligned",
      OPERATIONS_INCIDENT_RESPONSE_BASE === OPERATIONS_CUSTOMER_SUCCESS_ID,
      `base=${OPERATIONS_INCIDENT_RESPONSE_BASE}`,
    ),
  );

  const operation = getProductionOperation(incident.productionOperationId);
  checks.push(
    check(
      "IR-PRODUCTION",
      "production",
      "Production operation bound",
      !!operation && operation.productId === incident.productId,
      operation
        ? `operation=${operation.id} status=${operation.status}`
        : "production operation missing",
    ),
  );

  const support = getSupportSlaProfile(incident.supportSlaProfileId);
  checks.push(
    check(
      "IR-SLA",
      "support",
      "Support SLA profile active",
      !!support &&
        support.productId === incident.productId &&
        support.status === "ACTIVE",
      support
        ? `sla=${support.id} status=${support.status}`
        : "support sla missing",
    ),
  );

  if (incident.supportIncidentId) {
    const supportIncident = getSupportIncident(incident.supportIncidentId);
    checks.push(
      check(
        "IR-SUPPORT-INCIDENT",
        "support",
        "Linked support incident present",
        !!supportIncident,
        supportIncident
          ? `supportIncident=${supportIncident.id} status=${supportIncident.status}`
          : "support incident missing",
      ),
    );
  } else {
    checks.push(
      check(
        "IR-SUPPORT-INCIDENT",
        "support",
        "Linked support incident present",
        false,
        "supportIncidentId missing",
      ),
    );
  }

  if (incident.customerHealthProfileId) {
    const health = getCustomerHealthProfile(incident.customerHealthProfileId);
    checks.push(
      check(
        "IR-CUSTOMER-SUCCESS",
        "customer-success",
        "Customer health profile bound",
        !!health && health.productId === incident.productId,
        health
          ? `health=${health.id} level=${health.health}`
          : "customer health missing",
      ),
    );
  }

  const escalations = listEscalationWorkflows({
    operationsIncidentId: incident.id,
  });
  checks.push(
    check(
      "IR-ESCALATION",
      "escalation",
      "Escalation workflow complete",
      escalations.some((w) => w.complete && !w.failed),
      `escalations=${escalations.length}`,
    ),
  );

  const resolutions = listIncidentResolutions({
    operationsIncidentId: incident.id,
  });
  checks.push(
    check(
      "IR-RESOLUTION",
      "resolution",
      "Resolution tracked",
      resolutions.length > 0 &&
        (incident.status === "RESOLVED" || incident.status === "CLOSED"),
      `resolutions=${resolutions.length} status=${incident.status}`,
    ),
  );

  const audits = listAdminAuditEntries({ productId: incident.productId }).filter(
    (e) =>
      e.detail.includes(incident.id) ||
      e.metadata?.operationsIncidentId === incident.id,
  );
  checks.push(
    check(
      "IR-AUDIT",
      "admin",
      "Admin audit trail recorded",
      audits.length >= 1,
      `audits=${audits.length}`,
    ),
  );

  checks.push(
    check(
      "IR-SEVERITY",
      "severity",
      "Severity classified",
      !!incident.severity &&
        (incident.severity === "SEV1" ||
          incident.severity === "SEV2" ||
          incident.severity === "SEV3" ||
          incident.severity === "SEV4"),
      `severity=${incident.severity} impact=${incident.impact}`,
    ),
  );

  const metrics = computeIncidentMetrics({
    productionOperationId: incident.productionOperationId,
  });
  checks.push(
    check(
      "IR-METRICS",
      "metrics",
      "Incident metrics acceptable",
      metrics.incidentCount >= 1 && metrics.mttrScore >= 50,
      `count=${metrics.incidentCount} mttr=${metrics.mttrScore}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    operationsIncidentId: incident.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `incident readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertIncidentReadinessReady(
  result: IncidentReadinessResult,
): asserts result is IncidentReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`incident response not ready: ${result.summary}`);
  }
}
