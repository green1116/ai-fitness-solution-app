/**
 * Post-Launch P7 — Operations Orchestration
 * Binds production / CS / incident / release / growth / support
 */

import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getCustomerHealthProfile } from "../customer-success/success.health";
import { getGrowthDashboard } from "../growth/growth.dashboard";
import { getOperationsIncident } from "../incident/incident.model";
import { getProductionOperation } from "../production/production.operation";
import { getOperationsRelease } from "../release/release.lifecycle";
import { getEnterpriseSupportCase } from "../support/support.case";
import {
  OPS_ORCHESTRATION_DOMAINS,
  OPS_ORCHESTRATION_STATUSES,
} from "./control.constants";
import type {
  CreateOperationsOrchestrationInput,
  OperationsOrchestration,
  OpsDomainBinding,
  OpsOrchestrationDomain,
  OpsOrchestrationStatus,
} from "./control.types";

const orchestrations = new Map<string, OperationsOrchestration>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOrchestration(
  orchestration: OperationsOrchestration,
): OperationsOrchestration {
  return {
    ...orchestration,
    domains: orchestration.domains.map((d) => ({ ...d })),
    metadata: { ...orchestration.metadata },
  };
}

function buildDomains(
  input: CreateOperationsOrchestrationInput,
): OpsDomainBinding[] {
  const bindings: Array<{
    domain: OpsOrchestrationDomain;
    refId?: string;
    label: string;
    present: boolean;
  }> = [
    {
      domain: "PRODUCTION",
      refId: input.productionOperationId,
      label: "Production operations",
      present: true,
    },
    {
      domain: "CUSTOMER_SUCCESS",
      refId: input.customerHealthProfileId,
      label: "Customer success",
      present: !!input.customerHealthProfileId,
    },
    {
      domain: "INCIDENT",
      refId: input.operationsIncidentId,
      label: "Incident response",
      present: !!input.operationsIncidentId,
    },
    {
      domain: "RELEASE",
      refId: input.operationsReleaseId,
      label: "Release management",
      present: !!input.operationsReleaseId,
    },
    {
      domain: "GROWTH",
      refId: input.growthDashboardId,
      label: "Growth analytics",
      present: !!input.growthDashboardId,
    },
    {
      domain: "SUPPORT",
      refId: input.supportCaseId,
      label: "Enterprise support",
      present: !!input.supportCaseId,
    },
  ];

  return bindings.map((b) => ({
    domain: b.domain,
    refId: b.refId?.trim() || "",
    label: b.label,
    present: b.present,
  }));
}

export function createOperationsOrchestration(
  input: CreateOperationsOrchestrationInput,
): OperationsOrchestration {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const productionOperationId = input.productionOperationId.trim();

  if (!name) throw new Error("operationsOrchestration.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const operation = getProductionOperation(productionOperationId);
  if (!operation || operation.productId !== productId) {
    throw new Error(
      `production operation not found: ${productionOperationId}`,
    );
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

  if (input.operationsReleaseId) {
    const release = getOperationsRelease(input.operationsReleaseId.trim());
    if (!release || release.productId !== productId) {
      throw new Error(
        `operations release not found: ${input.operationsReleaseId}`,
      );
    }
  }

  if (input.growthDashboardId) {
    const dashboard = getGrowthDashboard(input.growthDashboardId.trim());
    if (!dashboard || dashboard.productId !== productId) {
      throw new Error(
        `growth dashboard not found: ${input.growthDashboardId}`,
      );
    }
  }

  if (input.supportCaseId) {
    const supportCase = getEnterpriseSupportCase(input.supportCaseId.trim());
    if (!supportCase || supportCase.productId !== productId) {
      throw new Error(
        `enterprise support case not found: ${input.supportCaseId}`,
      );
    }
  }

  const domains = buildDomains(input);
  for (const domain of domains) {
    if (
      !(OPS_ORCHESTRATION_DOMAINS as readonly string[]).includes(domain.domain)
    ) {
      throw new Error(`invalid orchestration domain: ${domain.domain}`);
    }
  }

  const id = input.id?.trim() || createId("opsorch");
  if (orchestrations.has(id)) {
    throw new Error(`operations orchestration already exists: ${id}`);
  }

  const now = nowIso();
  const orchestration: OperationsOrchestration = {
    id,
    name,
    productId,
    productionOperationId,
    customerHealthProfileId: input.customerHealthProfileId?.trim() || undefined,
    operationsIncidentId: input.operationsIncidentId?.trim() || undefined,
    operationsReleaseId: input.operationsReleaseId?.trim() || undefined,
    growthDashboardId: input.growthDashboardId?.trim() || undefined,
    supportCaseId: input.supportCaseId?.trim() || undefined,
    domains,
    status: "DRAFT",
    detail: input.detail?.trim() || "operations orchestration draft",
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  orchestrations.set(id, orchestration);
  return cloneOrchestration(orchestration);
}

export function setOperationsOrchestrationStatus(
  id: string,
  status: OpsOrchestrationStatus,
  detail?: string,
): OperationsOrchestration {
  const orchestration = orchestrations.get(id.trim());
  if (!orchestration) {
    throw new Error(`operations orchestration not found: ${id}`);
  }
  if (!(OPS_ORCHESTRATION_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid orchestration status: ${status}`);
  }
  orchestration.status = status;
  if (detail) orchestration.detail = detail.trim();
  orchestration.updatedAt = nowIso();
  orchestrations.set(orchestration.id, orchestration);
  return cloneOrchestration(orchestration);
}

export function activateOperationsOrchestration(
  id: string,
): OperationsOrchestration {
  return setOperationsOrchestrationStatus(id, "ACTIVE", "control plane active");
}

export function getOperationsOrchestration(
  id: string,
): OperationsOrchestration | undefined {
  const orchestration = orchestrations.get(id.trim());
  return orchestration ? cloneOrchestration(orchestration) : undefined;
}

export function listOperationsOrchestrations(filter?: {
  productId?: string;
  status?: OpsOrchestrationStatus;
}): OperationsOrchestration[] {
  let result = [...orchestrations.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((o) => o.productId === pid);
  }
  if (filter?.status) result = result.filter((o) => o.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOrchestration);
}

export function clearOperationsOrchestrations(): void {
  orchestrations.clear();
}
