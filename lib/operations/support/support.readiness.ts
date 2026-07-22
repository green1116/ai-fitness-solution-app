/**
 * Post-Launch P6 — Enterprise Support Readiness
 * Integrates SLA support, incident response, customer success, admin audit
 */

import { listAdminAuditEntries } from "../../product/e12/admin/admin.audit";
import { getSupportSlaProfile } from "../../launch/support/support.profile";
import { getCustomerHealthProfile } from "../customer-success/success.health";
import { OPERATIONS_GROWTH_ANALYTICS_ID } from "../growth/growth.constants";
import { getOperationsIncident } from "../incident/incident.model";
import { getEnterpriseSupportCase } from "./support.case";
import { OPERATIONS_ENTERPRISE_SUPPORT_BASE } from "./support.constants";
import { getKnowledgeArticle, listKnowledgeArticles } from "./support.knowledge";
import { computeEnterpriseSupportMetrics } from "./support.metrics";
import { listEscalationRoutingDecisions } from "./support.routing";
import { listCustomerSupportWorkflows } from "./support.workflow";
import type {
  EnterpriseSupportReadinessCheck,
  EnterpriseSupportReadinessResult,
} from "./support.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): EnterpriseSupportReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateEnterpriseSupportReadiness(
  supportCaseId: string,
): EnterpriseSupportReadinessResult {
  const supportCase = getEnterpriseSupportCase(supportCaseId.trim());
  if (!supportCase) {
    return {
      supportCaseId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "ES-CASE",
          "case",
          "Enterprise support case exists",
          false,
          `case not found: ${supportCaseId}`,
        ),
      ],
      summary: "enterprise support readiness not ready: case missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: EnterpriseSupportReadinessCheck[] = [];

  checks.push(
    check(
      "ES-BASE",
      "operations",
      "P5 growth analytics baseline aligned",
      OPERATIONS_ENTERPRISE_SUPPORT_BASE === OPERATIONS_GROWTH_ANALYTICS_ID,
      `base=${OPERATIONS_ENTERPRISE_SUPPORT_BASE}`,
    ),
  );

  const sla = getSupportSlaProfile(supportCase.supportSlaProfileId);
  checks.push(
    check(
      "ES-SLA",
      "sla-support",
      "Support SLA profile active",
      !!sla &&
        sla.productId === supportCase.productId &&
        sla.status === "ACTIVE",
      sla ? `sla=${sla.id} status=${sla.status}` : "sla missing",
    ),
  );

  if (supportCase.customerHealthProfileId) {
    const health = getCustomerHealthProfile(supportCase.customerHealthProfileId);
    checks.push(
      check(
        "ES-CUSTOMER-SUCCESS",
        "customer-success",
        "Customer health profile bound",
        !!health && health.productId === supportCase.productId,
        health
          ? `health=${health.id} level=${health.health}`
          : "customer health missing",
      ),
    );
  }

  if (supportCase.operationsIncidentId) {
    const incident = getOperationsIncident(supportCase.operationsIncidentId);
    checks.push(
      check(
        "ES-INCIDENT",
        "incident",
        "Operations incident linked",
        !!incident && incident.productId === supportCase.productId,
        incident
          ? `incident=${incident.id} status=${incident.status}`
          : "incident missing",
      ),
    );
  }

  const workflows = listCustomerSupportWorkflows({
    supportCaseId: supportCase.id,
  });
  checks.push(
    check(
      "ES-WORKFLOW",
      "workflow",
      "Customer support workflow complete",
      workflows.some((w) => w.complete && !w.failed),
      `workflows=${workflows.length}`,
    ),
  );

  const routings = listEscalationRoutingDecisions({
    supportCaseId: supportCase.id,
  });
  checks.push(
    check(
      "ES-ROUTING",
      "routing",
      "Escalation routing recorded",
      routings.length >= 1,
      `routings=${routings.length}`,
    ),
  );

  const knowledgeOk = supportCase.knowledgeArticleId
    ? !!getKnowledgeArticle(supportCase.knowledgeArticleId)
    : listKnowledgeArticles({
        productId: supportCase.productId,
        status: "PUBLISHED",
      }).length >= 1;
  checks.push(
    check(
      "ES-KNOWLEDGE",
      "knowledge",
      "Knowledge article available",
      knowledgeOk,
      supportCase.knowledgeArticleId
        ? `article=${supportCase.knowledgeArticleId}`
        : "published knowledge present",
    ),
  );

  const audits = listAdminAuditEntries({
    productId: supportCase.productId,
  }).filter(
    (e) =>
      e.detail.includes(supportCase.id) ||
      e.metadata?.supportCaseId === supportCase.id,
  );
  checks.push(
    check(
      "ES-AUDIT",
      "admin",
      "Admin audit trail recorded",
      audits.length >= 1,
      `audits=${audits.length}`,
    ),
  );

  checks.push(
    check(
      "ES-LIFECYCLE",
      "case",
      "Case resolved or closed",
      supportCase.status === "RESOLVED" || supportCase.status === "CLOSED",
      `status=${supportCase.status}`,
    ),
  );

  const metrics = computeEnterpriseSupportMetrics({
    productId: supportCase.productId,
    supportSlaProfileId: supportCase.supportSlaProfileId,
  });
  checks.push(
    check(
      "ES-METRICS",
      "metrics",
      "Support metrics acceptable",
      metrics.caseCount >= 1 && metrics.supportHealthScore >= 50,
      `cases=${metrics.caseCount} score=${metrics.supportHealthScore}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    supportCaseId: supportCase.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `enterprise support readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertEnterpriseSupportReadinessReady(
  result: EnterpriseSupportReadinessResult,
): asserts result is EnterpriseSupportReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`enterprise support not ready: ${result.summary}`);
  }
}
