/**
 * Post-Launch P6 — Escalation Routing
 * Routes to L2/L3, incident response, or customer success
 */

import { recordAdminAudit } from "../../product/e12/admin/admin.audit";
import { getSupportSlaProfile } from "../../launch/support/support.profile";
import { openOperationsIncident } from "../incident/incident.model";
import { ESCALATION_ROUTES } from "./support.constants";
import {
  bindOperationsIncidentToCase,
  getEnterpriseSupportCase,
  setEnterpriseSupportCaseStatus,
  setSupportCaseRoute,
} from "./support.case";
import type {
  EscalationRoute,
  EscalationRoutingDecision,
  RouteSupportEscalationInput,
} from "./support.types";

const routings = new Map<string, EscalationRoutingDecision>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDecision(
  decision: EscalationRoutingDecision,
): EscalationRoutingDecision {
  return { ...decision };
}

function priorityToImpact(priority: string): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  if (priority === "P1") return "CRITICAL";
  if (priority === "P2") return "HIGH";
  if (priority === "P3") return "MEDIUM";
  return "LOW";
}

export function routeSupportEscalation(
  input: RouteSupportEscalationInput,
): EscalationRoutingDecision {
  const supportCaseId = input.supportCaseId.trim();
  const toRoute = input.toRoute;

  const supportCase = getEnterpriseSupportCase(supportCaseId);
  if (!supportCase) {
    throw new Error(`enterprise support case not found: ${supportCaseId}`);
  }
  if (!(ESCALATION_ROUTES as readonly string[]).includes(toRoute)) {
    throw new Error(`invalid escalation route: ${toRoute}`);
  }
  if (supportCase.status === "CLOSED") {
    throw new Error(`cannot escalate closed case: ${supportCase.id}`);
  }

  const fromRoute: EscalationRoute = supportCase.route ?? "L1_SUPPORT";
  let linkedIncidentId = supportCase.operationsIncidentId;

  if (
    (toRoute === "INCIDENT_RESPONSE" || input.linkIncident) &&
    !linkedIncidentId
  ) {
    const sla = getSupportSlaProfile(supportCase.supportSlaProfileId);
    if (!sla) {
      throw new Error(
        `support sla profile not found: ${supportCase.supportSlaProfileId}`,
      );
    }
    // productionOperationId is optional on incident - but openOperationsIncident requires it
    // We need production operation - check if incident already exists or we have metadata
    const productionOperationId =
      typeof supportCase.metadata.productionOperationId === "string"
        ? supportCase.metadata.productionOperationId
        : undefined;
    if (!productionOperationId) {
      throw new Error(
        "productionOperationId metadata required to open linked incident",
      );
    }
    const incident = openOperationsIncident({
      id: `${supportCase.id}.incident`,
      title: `Escalated: ${supportCase.title}`,
      productId: supportCase.productId,
      productionOperationId,
      supportSlaProfileId: supportCase.supportSlaProfileId,
      customerHealthProfileId: supportCase.customerHealthProfileId,
      impact: priorityToImpact(supportCase.priority),
      urgency: supportCase.priority === "P1" ? "IMMEDIATE" : "HIGH",
      detail: `escalated from support case ${supportCase.id}`,
    });
    linkedIncidentId = incident.id;
    bindOperationsIncidentToCase(supportCase.id, incident.id);
  }

  setSupportCaseRoute(supportCase.id, toRoute);
  if (toRoute !== "L1_SUPPORT") {
    setEnterpriseSupportCaseStatus(
      supportCase.id,
      "ESCALATED",
      `routed to ${toRoute}`,
    );
  }

  const sla = getSupportSlaProfile(supportCase.supportSlaProfileId);
  const audit = recordAdminAudit({
    action: "PRODUCT_CONFIG_SET",
    actorUserId: "enterprise-support-ops",
    organizationId: sla?.organizationId,
    productTenantId: sla?.productTenantId,
    productId: supportCase.productId,
    detail: `support escalation ${supportCase.id}: ${fromRoute} -> ${toRoute}`,
    metadata: {
      supportCaseId: supportCase.id,
      fromRoute,
      toRoute,
      linkedIncidentId,
    },
  });

  const id = input.id?.trim() || createId("escroute");
  if (routings.has(id)) {
    throw new Error(`escalation routing already exists: ${id}`);
  }

  const decision: EscalationRoutingDecision = {
    id,
    supportCaseId: supportCase.id,
    fromRoute,
    toRoute,
    reason: input.reason?.trim() || `escalate to ${toRoute}`,
    linkedIncidentId,
    auditEntryId: audit.id,
    routedAt: nowIso(),
  };
  routings.set(id, decision);
  return cloneDecision(decision);
}

export function getEscalationRoutingDecision(
  id: string,
): EscalationRoutingDecision | undefined {
  const decision = routings.get(id.trim());
  return decision ? cloneDecision(decision) : undefined;
}

export function listEscalationRoutingDecisions(filter?: {
  supportCaseId?: string;
  toRoute?: EscalationRoute;
}): EscalationRoutingDecision[] {
  let result = [...routings.values()];
  if (filter?.supportCaseId) {
    const cid = filter.supportCaseId.trim();
    result = result.filter((r) => r.supportCaseId === cid);
  }
  if (filter?.toRoute) {
    result = result.filter((r) => r.toRoute === filter.toRoute);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDecision);
}

export function clearEscalationRoutingDecisions(): void {
  routings.clear();
}
