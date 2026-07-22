/**
 * Post-Launch P3 — Resolution Tracking
 */

import { recordAdminAudit } from "../../product/e12/admin/admin.audit";
import {
  resolveSupportIncident,
} from "../../launch/support/support.incident";
import { getSupportSlaProfile } from "../../launch/support/support.profile";
import { RESOLUTION_OUTCOMES } from "./incident.constants";
import {
  getOperationsIncident,
  setOperationsIncidentStatus,
} from "./incident.model";
import type {
  IncidentResolution,
  RecordIncidentResolutionInput,
  ResolutionOutcome,
} from "./incident.types";

const resolutions = new Map<string, IncidentResolution>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function minutesBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

function cloneResolution(resolution: IncidentResolution): IncidentResolution {
  return { ...resolution };
}

export function recordIncidentResolution(
  input: RecordIncidentResolutionInput,
): IncidentResolution {
  const operationsIncidentId = input.operationsIncidentId.trim();
  const outcome = input.outcome;

  const incident = getOperationsIncident(operationsIncidentId);
  if (!incident) {
    throw new Error(`operations incident not found: ${operationsIncidentId}`);
  }
  if (!(RESOLUTION_OUTCOMES as readonly string[]).includes(outcome)) {
    throw new Error(`invalid resolution outcome: ${outcome}`);
  }
  if (incident.status === "CLOSED" || incident.status === "RESOLVED") {
    throw new Error(
      `operations incident already ${incident.status.toLowerCase()}: ${incident.id}`,
    );
  }

  if (incident.supportIncidentId) {
    resolveSupportIncident(
      incident.supportIncidentId,
      input.detail?.trim() || `ops resolution ${outcome}`,
    );
  }

  const now = nowIso();
  setOperationsIncidentStatus(
    incident.id,
    "RESOLVED",
    input.detail?.trim() || `resolved: ${outcome}`,
  );

  const refreshed = getOperationsIncident(incident.id)!;
  const responseMinutes = refreshed.acknowledgedAt
    ? minutesBetween(refreshed.openedAt, refreshed.acknowledgedAt)
    : minutesBetween(refreshed.openedAt, now);
  const resolutionMinutes = minutesBetween(refreshed.openedAt, now);

  const support = getSupportSlaProfile(refreshed.supportSlaProfileId);
  const audit = recordAdminAudit({
    action: "PRODUCT_CONFIG_SET",
    actorUserId: input.resolvedBy?.trim() || "incident-ops",
    organizationId: support?.organizationId,
    productTenantId: support?.productTenantId,
    productId: refreshed.productId,
    detail: `operations incident resolved: ${refreshed.id} outcome=${outcome}`,
    metadata: { operationsIncidentId: refreshed.id, outcome },
  });

  const id = input.id?.trim() || createId("resolution");
  if (resolutions.has(id)) {
    throw new Error(`incident resolution already exists: ${id}`);
  }

  const resolution: IncidentResolution = {
    id,
    operationsIncidentId: refreshed.id,
    outcome: outcome as ResolutionOutcome,
    detail: input.detail?.trim() || `outcome=${outcome}`,
    resolvedBy: input.resolvedBy?.trim() || "incident-ops",
    responseMinutes,
    resolutionMinutes,
    auditEntryId: audit.id,
    resolvedAt: now,
  };
  resolutions.set(id, resolution);

  setOperationsIncidentStatus(refreshed.id, "CLOSED", "closed after resolution");
  return cloneResolution(resolution);
}

export function getIncidentResolution(
  id: string,
): IncidentResolution | undefined {
  const resolution = resolutions.get(id.trim());
  return resolution ? cloneResolution(resolution) : undefined;
}

export function listIncidentResolutions(filter?: {
  operationsIncidentId?: string;
  outcome?: ResolutionOutcome;
}): IncidentResolution[] {
  let result = [...resolutions.values()];
  if (filter?.operationsIncidentId) {
    const iid = filter.operationsIncidentId.trim();
    result = result.filter((r) => r.operationsIncidentId === iid);
  }
  if (filter?.outcome) {
    result = result.filter((r) => r.outcome === filter.outcome);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneResolution);
}

export function clearIncidentResolutions(): void {
  resolutions.clear();
}
