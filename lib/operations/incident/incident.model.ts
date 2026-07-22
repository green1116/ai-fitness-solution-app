/**
 * Post-Launch P3 — Incident Model
 * Integrates production operations, SLA support, customer success
 */

import { recordAdminAudit } from "../../product/e12/admin/admin.audit";
import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getSupportSlaProfile } from "../../launch/support/support.profile";
import { openSupportIncident } from "../../launch/support/support.incident";
import { getCustomerHealthProfile } from "../customer-success/success.health";
import { getProductionOperation } from "../production/production.operation";
import {
  OPERATIONS_INCIDENT_SEVERITIES,
  OPERATIONS_INCIDENT_STATUSES,
} from "./incident.constants";
import {
  assertSeverityCompatible,
  classifyIncidentSeverity,
} from "./incident.severity";
import type {
  OpenOperationsIncidentInput,
  OperationsIncident,
  OperationsIncidentSeverity,
  OperationsIncidentStatus,
} from "./incident.types";

const incidents = new Map<string, OperationsIncident>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIncident(incident: OperationsIncident): OperationsIncident {
  return { ...incident, metadata: { ...incident.metadata } };
}

function auditIncident(
  incident: OperationsIncident,
  detail: string,
): void {
  const support = getSupportSlaProfile(incident.supportSlaProfileId);
  recordAdminAudit({
    action: "PRODUCT_CONFIG_SET",
    actorUserId: "incident-ops",
    organizationId: support?.organizationId,
    productTenantId: support?.productTenantId,
    productId: incident.productId,
    detail,
    metadata: { operationsIncidentId: incident.id },
  });
}

export function openOperationsIncident(
  input: OpenOperationsIncidentInput,
): OperationsIncident {
  const title = input.title.trim();
  const productId = input.productId.trim();
  const productionOperationId = input.productionOperationId.trim();
  const supportSlaProfileId = input.supportSlaProfileId.trim();

  if (!title) throw new Error("operationsIncident.title is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const operation = getProductionOperation(productionOperationId);
  if (!operation || operation.productId !== productId) {
    throw new Error(
      `production operation not found: ${productionOperationId}`,
    );
  }

  const support = getSupportSlaProfile(supportSlaProfileId);
  if (!support || support.productId !== productId) {
    throw new Error(`support sla profile not found: ${supportSlaProfileId}`);
  }
  if (support.status !== "ACTIVE") {
    throw new Error(`support sla profile not ACTIVE: ${supportSlaProfileId}`);
  }

  if (input.customerHealthProfileId) {
    const health = getCustomerHealthProfile(input.customerHealthProfileId.trim());
    if (!health || health.productId !== productId) {
      throw new Error(
        `customer health profile not found: ${input.customerHealthProfileId}`,
      );
    }
  }

  const impact = input.impact ?? "MEDIUM";
  const urgency = input.urgency ?? "NORMAL";
  const classified = classifyIncidentSeverity({ impact, urgency });
  const severity: OperationsIncidentSeverity =
    input.severity ?? classified.severity;

  if (
    !(OPERATIONS_INCIDENT_SEVERITIES as readonly string[]).includes(severity)
  ) {
    throw new Error(`invalid incident severity: ${severity}`);
  }
  assertSeverityCompatible(severity, impact, urgency);

  const id = input.id?.trim() || createId("opsinc");
  if (incidents.has(id)) {
    throw new Error(`operations incident already exists: ${id}`);
  }

  const supportIncident = openSupportIncident({
    id: `${id}.support`,
    supportSlaProfileId,
    title: `[ops] ${title}`,
    severity,
  });

  const now = nowIso();
  const incident: OperationsIncident = {
    id,
    title,
    productId,
    productionOperationId,
    supportSlaProfileId,
    customerHealthProfileId: input.customerHealthProfileId?.trim() || undefined,
    supportIncidentId: supportIncident.id,
    impact,
    urgency,
    severity,
    status: "OPEN",
    detail: input.detail?.trim() || classified.detail,
    metadata: { ...(input.metadata ?? {}), classificationScore: classified.score },
    openedAt: now,
    updatedAt: now,
  };
  incidents.set(id, incident);
  auditIncident(incident, `operations incident opened: ${id} severity=${severity}`);
  return cloneIncident(incident);
}

export function setOperationsIncidentStatus(
  id: string,
  status: OperationsIncidentStatus,
  detail?: string,
): OperationsIncident {
  const incident = incidents.get(id.trim());
  if (!incident) throw new Error(`operations incident not found: ${id}`);
  if (!(OPERATIONS_INCIDENT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid incident status: ${status}`);
  }
  if (incident.status === "CLOSED") {
    throw new Error(`operations incident already closed: ${incident.id}`);
  }

  const now = nowIso();
  incident.status = status;
  if (detail) incident.detail = detail.trim();
  if (status === "ACKNOWLEDGED" && !incident.acknowledgedAt) {
    incident.acknowledgedAt = now;
  }
  if (status === "ESCALATED" && !incident.escalatedAt) {
    incident.escalatedAt = now;
  }
  if (status === "RESOLVED" && !incident.resolvedAt) {
    incident.resolvedAt = now;
  }
  if (status === "CLOSED") {
    incident.closedAt = now;
  }
  incident.updatedAt = now;
  incidents.set(incident.id, incident);
  auditIncident(incident, `operations incident ${incident.id} -> ${status}`);
  return cloneIncident(incident);
}

export function getOperationsIncident(
  id: string,
): OperationsIncident | undefined {
  const incident = incidents.get(id.trim());
  return incident ? cloneIncident(incident) : undefined;
}

export function listOperationsIncidents(filter?: {
  productId?: string;
  productionOperationId?: string;
  supportSlaProfileId?: string;
  customerHealthProfileId?: string;
  status?: OperationsIncidentStatus;
  severity?: OperationsIncidentSeverity;
}): OperationsIncident[] {
  let result = [...incidents.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((i) => i.productId === pid);
  }
  if (filter?.productionOperationId) {
    const oid = filter.productionOperationId.trim();
    result = result.filter((i) => i.productionOperationId === oid);
  }
  if (filter?.supportSlaProfileId) {
    const sid = filter.supportSlaProfileId.trim();
    result = result.filter((i) => i.supportSlaProfileId === sid);
  }
  if (filter?.customerHealthProfileId) {
    const hid = filter.customerHealthProfileId.trim();
    result = result.filter((i) => i.customerHealthProfileId === hid);
  }
  if (filter?.status) result = result.filter((i) => i.status === filter.status);
  if (filter?.severity) {
    result = result.filter((i) => i.severity === filter.severity);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneIncident);
}

export function clearOperationsIncidents(): void {
  incidents.clear();
}
