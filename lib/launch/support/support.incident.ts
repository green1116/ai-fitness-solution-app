/**
 * Launch P5 — Incident Workflow
 * Records admin audit on key transitions
 */

import { recordAdminAudit } from "../../product/e12/admin/admin.audit";
import { INCIDENT_SEVERITIES, INCIDENT_WORKFLOW_STEPS } from "./support.constants";
import {
  getSupportSlaProfile,
  setSupportSlaProfileStatus,
} from "./support.profile";
import { getSupportTier } from "./support.tier";
import type {
  AdvanceIncidentInput,
  IncidentSeverity,
  IncidentStatus,
  IncidentStepRecord,
  IncidentWorkflowStep,
  OpenIncidentInput,
  SupportIncident,
} from "./support.types";

const incidents = new Map<string, SupportIncident>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneIncident(incident: SupportIncident): SupportIncident {
  return {
    ...incident,
    steps: incident.steps.map((s) => ({ ...s })),
    metadata: { ...incident.metadata },
  };
}

function initialSteps(): IncidentStepRecord[] {
  return INCIDENT_WORKFLOW_STEPS.map((step) => ({
    step,
    status: step === "OPEN" ? "COMPLETED" : "PENDING",
    detail: step === "OPEN" ? "incident opened" : "pending",
    completedAt: step === "OPEN" ? nowIso() : undefined,
  }));
}

function markStep(
  incident: SupportIncident,
  step: IncidentWorkflowStep,
  detail: string,
): void {
  const record = incident.steps.find((s) => s.step === step);
  if (!record) return;
  record.status = "COMPLETED";
  record.detail = detail;
  record.completedAt = nowIso();
  incident.currentStep = step;
  incident.updatedAt = nowIso();
}

function minutesBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.max(0, Math.round(ms / 60000));
}

function auditIncident(
  profile: NonNullable<ReturnType<typeof getSupportSlaProfile>>,
  detail: string,
): void {
  recordAdminAudit({
    action: "PRODUCT_CONFIG_SET",
    actorUserId: "support-system",
    organizationId: profile.organizationId,
    productTenantId: profile.productTenantId,
    productId: profile.productId,
    detail,
  });
}

export function openSupportIncident(
  input: OpenIncidentInput,
): SupportIncident {
  const supportSlaProfileId = input.supportSlaProfileId.trim();
  const title = input.title.trim();
  if (!title) throw new Error("incident.title is required");

  const profile = getSupportSlaProfile(supportSlaProfileId);
  if (!profile) {
    throw new Error(`support sla profile not found: ${supportSlaProfileId}`);
  }
  if (profile.status !== "ACTIVE") {
    throw new Error(
      `support sla profile must be ACTIVE (current=${profile.status})`,
    );
  }

  const severity: IncidentSeverity = input.severity ?? "SEV3";
  if (!(INCIDENT_SEVERITIES as readonly string[]).includes(severity)) {
    throw new Error(`invalid incident severity: ${severity}`);
  }

  const id = input.id?.trim() || createId("incident");
  if (incidents.has(id)) throw new Error(`incident already exists: ${id}`);

  const openedAt = nowIso();
  const incident: SupportIncident = {
    id,
    supportSlaProfileId,
    title,
    severity,
    status: "OPEN",
    steps: initialSteps(),
    currentStep: "OPEN",
    openedAt,
    metadata: { ...(input.metadata ?? {}) },
    updatedAt: openedAt,
  };
  incidents.set(id, incident);
  auditIncident(profile, `incident opened: ${id} severity=${severity}`);
  return cloneIncident(incident);
}

export function advanceSupportIncident(
  input: AdvanceIncidentInput,
): SupportIncident {
  const incident = incidents.get(input.incidentId.trim());
  if (!incident) throw new Error(`incident not found: ${input.incidentId}`);

  const profile = getSupportSlaProfile(incident.supportSlaProfileId);
  if (!profile) {
    throw new Error(
      `support sla profile not found: ${incident.supportSlaProfileId}`,
    );
  }

  const detail = input.detail?.trim() || "advanced";
  const now = nowIso();

  const transitions: Record<
    IncidentStatus,
    { nextStatus: IncidentStatus; step: IncidentWorkflowStep }
  > = {
    OPEN: { nextStatus: "ACKNOWLEDGED", step: "ACKNOWLEDGE" },
    ACKNOWLEDGED: { nextStatus: "IN_PROGRESS", step: "INVESTIGATE" },
    IN_PROGRESS: { nextStatus: "RESOLVED", step: "RESOLVE" },
    RESOLVED: { nextStatus: "CLOSED", step: "CLOSE" },
    CLOSED: { nextStatus: "CLOSED", step: "CLOSE" },
  };

  if (incident.status === "CLOSED") {
    throw new Error(`incident already closed: ${incident.id}`);
  }

  const transition = transitions[incident.status];
  markStep(incident, transition.step, detail);
  incident.status = transition.nextStatus;

  if (transition.nextStatus === "ACKNOWLEDGED") {
    incident.acknowledgedAt = now;
    incident.responseMinutes = minutesBetween(incident.openedAt, now);
  }
  if (transition.nextStatus === "RESOLVED") {
    incident.resolvedAt = now;
    incident.resolutionMinutes = minutesBetween(incident.openedAt, now);
  }
  if (transition.nextStatus === "CLOSED") {
    incident.closedAt = now;
  }

  incidents.set(incident.id, incident);
  auditIncident(
    profile,
    `incident ${incident.id} -> ${incident.status}: ${detail}`,
  );
  return cloneIncident(incident);
}

export function resolveSupportIncident(
  incidentId: string,
  detail?: string,
): SupportIncident {
  let incident = getSupportIncident(incidentId);
  if (!incident) throw new Error(`incident not found: ${incidentId}`);

  while (incident.status !== "RESOLVED" && incident.status !== "CLOSED") {
    incident = advanceSupportIncident({
      incidentId: incident.id,
      detail: detail ?? `auto-advance to ${incident.status}`,
    });
  }
  return incident;
}

export function getSupportIncident(id: string): SupportIncident | undefined {
  const incident = incidents.get(id.trim());
  return incident ? cloneIncident(incident) : undefined;
}

export function listSupportIncidents(filter?: {
  supportSlaProfileId?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
}): SupportIncident[] {
  let result = [...incidents.values()];
  if (filter?.supportSlaProfileId) {
    const pid = filter.supportSlaProfileId.trim();
    result = result.filter((i) => i.supportSlaProfileId === pid);
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

export function activateSupportSlaProfile(id: string): ReturnType<
  typeof setSupportSlaProfileStatus
> {
  const profile = getSupportSlaProfile(id);
  if (!profile) throw new Error(`support sla profile not found: ${id}`);
  if (!profile.supportTierId || !getSupportTier(profile.supportTierId)) {
    throw new Error(`support tier required to activate profile: ${id}`);
  }
  return setSupportSlaProfileStatus(id, "ACTIVE");
}

export function clearSupportIncidents(): void {
  incidents.clear();
}
