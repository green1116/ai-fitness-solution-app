/**
 * Post-Launch P6 — Support Case Model
 * Integrates SLA support, customer success, incident response, admin audit
 */

import { recordAdminAudit } from "../../product/e12/admin/admin.audit";
import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getSupportSlaProfile } from "../../launch/support/support.profile";
import { getCustomerHealthProfile } from "../customer-success/success.health";
import { getOperationsIncident } from "../incident/incident.model";
import {
  SUPPORT_CASE_PRIORITIES,
  SUPPORT_CASE_STATUSES,
} from "./support.constants";
import type {
  EnterpriseSupportCase,
  OpenSupportCaseInput,
  SupportCasePriority,
  SupportCaseStatus,
} from "./support.types";

const cases = new Map<string, EnterpriseSupportCase>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCase(supportCase: EnterpriseSupportCase): EnterpriseSupportCase {
  return { ...supportCase, metadata: { ...supportCase.metadata } };
}

function auditCase(supportCase: EnterpriseSupportCase, detail: string): void {
  const sla = getSupportSlaProfile(supportCase.supportSlaProfileId);
  recordAdminAudit({
    action: "PRODUCT_CONFIG_SET",
    actorUserId: "enterprise-support-ops",
    organizationId: sla?.organizationId,
    productTenantId: sla?.productTenantId,
    productId: supportCase.productId,
    detail,
    metadata: { supportCaseId: supportCase.id },
  });
}

export function openEnterpriseSupportCase(
  input: OpenSupportCaseInput,
): EnterpriseSupportCase {
  const title = input.title.trim();
  const productId = input.productId.trim();
  const supportSlaProfileId = input.supportSlaProfileId.trim();

  if (!title) throw new Error("supportCase.title is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const sla = getSupportSlaProfile(supportSlaProfileId);
  if (!sla || sla.productId !== productId) {
    throw new Error(`support sla profile not found: ${supportSlaProfileId}`);
  }
  if (sla.status !== "ACTIVE") {
    throw new Error(`support sla profile not ACTIVE: ${supportSlaProfileId}`);
  }

  if (input.customerHealthProfileId) {
    const health = getCustomerHealthProfile(
      input.customerHealthProfileId.trim(),
    );
    if (!health || health.productId !== productId) {
      throw new Error(
        `customer health profile not found: ${input.customerHealthProfileId}`,
      );
    }
  }

  if (input.operationsIncidentId) {
    const incident = getOperationsIncident(input.operationsIncidentId.trim());
    if (!incident || incident.productId !== productId) {
      throw new Error(
        `operations incident not found: ${input.operationsIncidentId}`,
      );
    }
  }

  const priority: SupportCasePriority = input.priority ?? "P3";
  if (!(SUPPORT_CASE_PRIORITIES as readonly string[]).includes(priority)) {
    throw new Error(`invalid support case priority: ${priority}`);
  }

  const id = input.id?.trim() || createId("escase");
  if (cases.has(id)) {
    throw new Error(`enterprise support case already exists: ${id}`);
  }

  const now = nowIso();
  const supportCase: EnterpriseSupportCase = {
    id,
    title,
    productId,
    supportSlaProfileId,
    customerHealthProfileId: input.customerHealthProfileId?.trim() || undefined,
    operationsIncidentId: input.operationsIncidentId?.trim() || undefined,
    priority,
    status: "OPEN",
    assignee: input.assignee?.trim() || undefined,
    route: "L1_SUPPORT",
    detail: input.detail?.trim() || "case opened",
    metadata: { ...(input.metadata ?? {}) },
    openedAt: now,
    updatedAt: now,
  };
  cases.set(id, supportCase);
  auditCase(supportCase, `enterprise support case opened: ${id}`);
  return cloneCase(supportCase);
}

export function setEnterpriseSupportCaseStatus(
  id: string,
  status: SupportCaseStatus,
  detail?: string,
): EnterpriseSupportCase {
  const supportCase = cases.get(id.trim());
  if (!supportCase) {
    throw new Error(`enterprise support case not found: ${id}`);
  }
  if (!(SUPPORT_CASE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid support case status: ${status}`);
  }
  if (supportCase.status === "CLOSED") {
    throw new Error(`enterprise support case already closed: ${supportCase.id}`);
  }

  const now = nowIso();
  supportCase.status = status;
  if (detail) supportCase.detail = detail.trim();
  if (status === "RESOLVED") supportCase.resolvedAt = now;
  if (status === "CLOSED") supportCase.closedAt = now;
  supportCase.updatedAt = now;
  cases.set(supportCase.id, supportCase);
  auditCase(supportCase, `enterprise support case ${supportCase.id} -> ${status}`);
  return cloneCase(supportCase);
}

export function bindKnowledgeArticleToCase(
  supportCaseId: string,
  knowledgeArticleId: string,
): EnterpriseSupportCase {
  const supportCase = cases.get(supportCaseId.trim());
  if (!supportCase) {
    throw new Error(`enterprise support case not found: ${supportCaseId}`);
  }
  supportCase.knowledgeArticleId = knowledgeArticleId.trim();
  supportCase.updatedAt = nowIso();
  cases.set(supportCase.id, supportCase);
  return cloneCase(supportCase);
}

export function bindOperationsIncidentToCase(
  supportCaseId: string,
  operationsIncidentId: string,
): EnterpriseSupportCase {
  const supportCase = cases.get(supportCaseId.trim());
  if (!supportCase) {
    throw new Error(`enterprise support case not found: ${supportCaseId}`);
  }
  const incident = getOperationsIncident(operationsIncidentId.trim());
  if (!incident || incident.productId !== supportCase.productId) {
    throw new Error(
      `operations incident not found: ${operationsIncidentId}`,
    );
  }
  supportCase.operationsIncidentId = incident.id;
  supportCase.updatedAt = nowIso();
  cases.set(supportCase.id, supportCase);
  return cloneCase(supportCase);
}

export function setSupportCaseRoute(
  supportCaseId: string,
  route: NonNullable<EnterpriseSupportCase["route"]>,
): EnterpriseSupportCase {
  const supportCase = cases.get(supportCaseId.trim());
  if (!supportCase) {
    throw new Error(`enterprise support case not found: ${supportCaseId}`);
  }
  supportCase.route = route;
  supportCase.updatedAt = nowIso();
  cases.set(supportCase.id, supportCase);
  return cloneCase(supportCase);
}

export function getEnterpriseSupportCase(
  id: string,
): EnterpriseSupportCase | undefined {
  const supportCase = cases.get(id.trim());
  return supportCase ? cloneCase(supportCase) : undefined;
}

export function listEnterpriseSupportCases(filter?: {
  productId?: string;
  supportSlaProfileId?: string;
  status?: SupportCaseStatus;
  priority?: SupportCasePriority;
}): EnterpriseSupportCase[] {
  let result = [...cases.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((c) => c.productId === pid);
  }
  if (filter?.supportSlaProfileId) {
    const sid = filter.supportSlaProfileId.trim();
    result = result.filter((c) => c.supportSlaProfileId === sid);
  }
  if (filter?.status) result = result.filter((c) => c.status === filter.status);
  if (filter?.priority) {
    result = result.filter((c) => c.priority === filter.priority);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCase);
}

export function clearEnterpriseSupportCases(): void {
  cases.clear();
}
