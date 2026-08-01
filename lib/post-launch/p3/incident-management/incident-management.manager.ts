/**
 * PL-3 — Incident Management Manager.
 * Minimal deterministic in-memory core — no IO / timers / providers.
 */

import {
  DEFAULT_INCIDENT_POLICY,
  INCIDENT_ESCALATION_LEVELS,
  INCIDENT_MANAGEMENT_ID,
  INCIDENT_RESOLUTION_STATES,
  INCIDENT_SEVERITIES,
  type AcknowledgeIncidentInput,
  type CloseIncidentInput,
  type EscalateIncidentInput,
  type IncidentEscalationLevel,
  type IncidentManagerSnapshot,
  type IncidentManagerStatus,
  type IncidentPolicy,
  type IncidentRecord,
  type IncidentResolutionState,
  type IncidentSeverity,
  type IncidentSnapshot,
  type InvestigateIncidentInput,
  type OpenIncidentInput,
  type ReopenIncidentInput,
  type ResolveIncidentInput,
  type SetIncidentSeverityInput,
} from "./incident-management.types";

function isSeverity(value: string): value is IncidentSeverity {
  return (INCIDENT_SEVERITIES as readonly string[]).includes(value);
}

function isState(value: string): value is IncidentResolutionState {
  return (INCIDENT_RESOLUTION_STATES as readonly string[]).includes(value);
}

function isEscalationLevel(value: number): value is IncidentEscalationLevel {
  return (INCIDENT_ESCALATION_LEVELS as readonly number[]).includes(value);
}

function cloneIncident(record: IncidentRecord): IncidentRecord {
  return { ...record };
}

function clonePolicy(policy: IncidentPolicy): IncidentPolicy {
  return {
    ...policy,
    autoEscalateSeverities: [...policy.autoEscalateSeverities],
  };
}

function isOpenLike(state: IncidentResolutionState): boolean {
  return (
    state === "open" ||
    state === "acknowledged" ||
    state === "investigating" ||
    state === "escalated"
  );
}

export type IncidentManagementManager = {
  readonly layerId: typeof INCIDENT_MANAGEMENT_ID;
  start: () => IncidentManagerSnapshot;
  stop: () => IncidentManagerSnapshot;
  status: () => IncidentManagerSnapshot;
  getPolicy: () => IncidentPolicy;
  setPolicy: (policy: IncidentPolicy) => IncidentPolicy;
  openIncident: (input: OpenIncidentInput) => IncidentRecord;
  getIncident: (incidentId: string) => IncidentRecord | undefined;
  listIncidents: (filter?: {
    severity?: IncidentSeverity;
    state?: IncidentResolutionState;
    serviceId?: string;
    openOnly?: boolean;
  }) => IncidentRecord[];
  acknowledge: (input: AcknowledgeIncidentInput) => IncidentRecord;
  investigate: (input: InvestigateIncidentInput) => IncidentRecord;
  escalate: (input: EscalateIncidentInput) => IncidentRecord;
  resolve: (input: ResolveIncidentInput) => IncidentRecord;
  close: (input: CloseIncidentInput) => IncidentRecord;
  reopen: (input: ReopenIncidentInput) => IncidentRecord;
  setSeverity: (input: SetIncidentSeverityInput) => IncidentRecord;
  snapshot: () => IncidentSnapshot;
  reset: () => void;
};

/**
 * Create a deterministic in-memory incident management manager.
 * Logical clock + sequential ids — no wall clock / RNG / timers.
 */
export function createIncidentManagementManager(
  managerId = "inc-mgr-1",
): IncidentManagementManager {
  let statusState: IncidentManagerStatus = "idle";
  let clock = 0;
  let seq = 0;
  let policy: IncidentPolicy = clonePolicy(DEFAULT_INCIDENT_POLICY);

  const incidents = new Map<string, IncidentRecord>();

  function tick(): number {
    clock += 1;
    return clock;
  }

  function nextId(prefix: string): string {
    seq += 1;
    return `${prefix}-${seq}`;
  }

  function openCount(): number {
    let count = 0;
    for (const incident of incidents.values()) {
      if (isOpenLike(incident.state)) count += 1;
    }
    return count;
  }

  function snapshotStatus(): IncidentManagerSnapshot {
    return {
      managerId,
      layerId: INCIDENT_MANAGEMENT_ID,
      status: statusState,
      clock,
      incidentCount: incidents.size,
      openCount: openCount(),
    };
  }

  function requireRunning(): void {
    if (statusState !== "running") {
      throw new Error(
        `incident management manager is not running: ${statusState}`,
      );
    }
  }

  function requireIncident(incidentId: string): IncidentRecord {
    const id = incidentId.trim();
    const record = incidents.get(id);
    if (!record) throw new Error(`incident not found: ${id}`);
    return record;
  }

  function enforceOpenCap(): void {
    const open = [...incidents.values()]
      .filter((i) => isOpenLike(i.state))
      .sort(
        (a, b) =>
          a.openedAt - b.openedAt || a.incidentId.localeCompare(b.incidentId),
      );
    while (open.length > policy.maxOpenIncidents) {
      const oldest = open.shift();
      if (!oldest) break;
      const at = clock;
      incidents.set(oldest.incidentId, {
        ...oldest,
        state: "closed",
        updatedAt: at,
        closedAt: at,
        resolvedAt: oldest.resolvedAt ?? at,
      });
    }
  }

  function transition(
    incidentId: string,
    nextState: IncidentResolutionState,
    patch: Partial<IncidentRecord> = {},
  ): IncidentRecord {
    const current = requireIncident(incidentId);
    if (current.state === "closed" && nextState !== "open") {
      throw new Error(`incident is closed: ${incidentId}`);
    }
    if (current.state === "resolved" && nextState === "escalated") {
      throw new Error(`cannot escalate resolved incident: ${incidentId}`);
    }
    const at = tick();
    const next: IncidentRecord = {
      ...current,
      ...patch,
      state: nextState,
      updatedAt: at,
    };
    incidents.set(current.incidentId, next);
    return cloneIncident(next);
  }

  return {
    layerId: INCIDENT_MANAGEMENT_ID,

    start(): IncidentManagerSnapshot {
      if (statusState === "running") {
        throw new Error("incident management manager already running");
      }
      statusState = "running";
      tick();
      return snapshotStatus();
    },

    stop(): IncidentManagerSnapshot {
      if (statusState !== "running") {
        throw new Error(
          `incident management manager cannot stop from: ${statusState}`,
        );
      }
      statusState = "stopped";
      tick();
      return snapshotStatus();
    },

    status(): IncidentManagerSnapshot {
      return snapshotStatus();
    },

    getPolicy(): IncidentPolicy {
      return clonePolicy(policy);
    },

    setPolicy(next: IncidentPolicy): IncidentPolicy {
      requireRunning();
      if (!Number.isInteger(next.maxOpenIncidents) || next.maxOpenIncidents < 1) {
        throw new Error("maxOpenIncidents must be an integer >= 1");
      }
      if (!isEscalationLevel(next.maxEscalationLevel)) {
        throw new Error(
          `invalid maxEscalationLevel: ${next.maxEscalationLevel}`,
        );
      }
      if (next.maxEscalationLevel < 1) {
        throw new Error("maxEscalationLevel must be >= 1");
      }
      for (const severity of next.autoEscalateSeverities) {
        if (!isSeverity(severity)) {
          throw new Error(`invalid autoEscalate severity: ${severity}`);
        }
      }
      policy = clonePolicy({
        ...next,
        autoEscalateSeverities: [...next.autoEscalateSeverities],
      });
      tick();
      enforceOpenCap();
      return clonePolicy(policy);
    },

    openIncident(input: OpenIncidentInput): IncidentRecord {
      requireRunning();
      const title = input.title.trim();
      if (!title) throw new Error("title is required");
      if (!isSeverity(input.severity)) {
        throw new Error(`invalid severity: ${input.severity}`);
      }
      const incidentId =
        (input.incidentId ?? "").trim() || nextId("inc");
      if (incidents.has(incidentId)) {
        throw new Error(`incident already exists: ${incidentId}`);
      }
      const serviceId = input.serviceId?.trim() || undefined;
      const at = tick();
      const autoEscalate = policy.autoEscalateSeverities.includes(
        input.severity,
      );
      const record: IncidentRecord = {
        incidentId,
        title,
        severity: input.severity,
        state: autoEscalate ? "escalated" : "open",
        escalationLevel: autoEscalate ? 1 : 0,
        serviceId,
        openedAt: at,
        updatedAt: at,
        escalatedAt: autoEscalate ? at : undefined,
      };
      incidents.set(incidentId, record);
      enforceOpenCap();
      return cloneIncident(incidents.get(incidentId)!);
    },

    getIncident(incidentId: string): IncidentRecord | undefined {
      const record = incidents.get(incidentId.trim());
      return record ? cloneIncident(record) : undefined;
    },

    listIncidents(filter?: {
      severity?: IncidentSeverity;
      state?: IncidentResolutionState;
      serviceId?: string;
      openOnly?: boolean;
    }): IncidentRecord[] {
      let result = [...incidents.values()];
      if (filter?.severity) {
        result = result.filter((i) => i.severity === filter.severity);
      }
      if (filter?.state) {
        if (!isState(filter.state)) {
          throw new Error(`invalid state filter: ${filter.state}`);
        }
        result = result.filter((i) => i.state === filter.state);
      }
      if (filter?.serviceId) {
        const sid = filter.serviceId.trim();
        result = result.filter((i) => i.serviceId === sid);
      }
      if (filter?.openOnly) {
        result = result.filter((i) => isOpenLike(i.state));
      }
      return result
        .sort(
          (a, b) =>
            a.openedAt - b.openedAt ||
            a.incidentId.localeCompare(b.incidentId),
        )
        .map(cloneIncident);
    },

    acknowledge(input: AcknowledgeIncidentInput): IncidentRecord {
      requireRunning();
      const current = requireIncident(input.incidentId);
      if (current.state !== "open" && current.state !== "escalated") {
        throw new Error(
          `cannot acknowledge incident in state: ${current.state}`,
        );
      }
      const at = tick();
      const next: IncidentRecord = {
        ...current,
        state: "acknowledged",
        updatedAt: at,
        acknowledgedAt: at,
      };
      incidents.set(current.incidentId, next);
      return cloneIncident(next);
    },

    investigate(input: InvestigateIncidentInput): IncidentRecord {
      requireRunning();
      const current = requireIncident(input.incidentId);
      if (
        current.state !== "open" &&
        current.state !== "acknowledged" &&
        current.state !== "escalated"
      ) {
        throw new Error(
          `cannot investigate incident in state: ${current.state}`,
        );
      }
      return transition(current.incidentId, "investigating");
    },

    escalate(input: EscalateIncidentInput): IncidentRecord {
      requireRunning();
      const current = requireIncident(input.incidentId);
      if (!isOpenLike(current.state)) {
        throw new Error(`cannot escalate incident in state: ${current.state}`);
      }
      const target =
        input.toLevel ??
        ((current.escalationLevel + 1) as IncidentEscalationLevel);
      if (!isEscalationLevel(target)) {
        throw new Error(`invalid escalation level: ${target}`);
      }
      if (target < 1) {
        throw new Error("escalation level must be >= 1");
      }
      if (target > policy.maxEscalationLevel) {
        throw new Error(
          `escalation level exceeds max: ${policy.maxEscalationLevel}`,
        );
      }
      if (target < current.escalationLevel) {
        throw new Error("cannot de-escalate via escalate()");
      }
      const at = tick();
      const next: IncidentRecord = {
        ...current,
        state: "escalated",
        escalationLevel: target,
        updatedAt: at,
        escalatedAt: at,
      };
      incidents.set(current.incidentId, next);
      return cloneIncident(next);
    },

    resolve(input: ResolveIncidentInput): IncidentRecord {
      requireRunning();
      const current = requireIncident(input.incidentId);
      if (!isOpenLike(current.state)) {
        throw new Error(`cannot resolve incident in state: ${current.state}`);
      }
      const at = tick();
      const next: IncidentRecord = {
        ...current,
        state: "resolved",
        updatedAt: at,
        resolvedAt: at,
      };
      incidents.set(current.incidentId, next);
      return cloneIncident(next);
    },

    close(input: CloseIncidentInput): IncidentRecord {
      requireRunning();
      const current = requireIncident(input.incidentId);
      if (current.state === "closed") {
        throw new Error(`incident already closed: ${current.incidentId}`);
      }
      if (current.state !== "resolved" && !isOpenLike(current.state)) {
        throw new Error(`cannot close incident in state: ${current.state}`);
      }
      const at = tick();
      const next: IncidentRecord = {
        ...current,
        state: "closed",
        updatedAt: at,
        resolvedAt: current.resolvedAt ?? at,
        closedAt: at,
      };
      incidents.set(current.incidentId, next);
      return cloneIncident(next);
    },

    reopen(input: ReopenIncidentInput): IncidentRecord {
      requireRunning();
      if (!policy.allowReopen) {
        throw new Error("reopen is disabled by policy");
      }
      const current = requireIncident(input.incidentId);
      if (current.state !== "resolved" && current.state !== "closed") {
        throw new Error(`cannot reopen incident in state: ${current.state}`);
      }
      const at = tick();
      const next: IncidentRecord = {
        ...current,
        state: "open",
        escalationLevel: 0,
        updatedAt: at,
        resolvedAt: undefined,
        closedAt: undefined,
      };
      incidents.set(current.incidentId, next);
      enforceOpenCap();
      return cloneIncident(incidents.get(current.incidentId)!);
    },

    setSeverity(input: SetIncidentSeverityInput): IncidentRecord {
      requireRunning();
      const current = requireIncident(input.incidentId);
      if (!isSeverity(input.severity)) {
        throw new Error(`invalid severity: ${input.severity}`);
      }
      if (current.state === "closed") {
        throw new Error(`cannot set severity on closed incident`);
      }
      const at = tick();
      const next: IncidentRecord = {
        ...current,
        severity: input.severity,
        updatedAt: at,
      };
      incidents.set(current.incidentId, next);
      return cloneIncident(next);
    },

    snapshot(): IncidentSnapshot {
      const list = this.listIncidents();
      let openCount = 0;
      let acknowledgedCount = 0;
      let investigatingCount = 0;
      let escalatedCount = 0;
      let resolvedCount = 0;
      let closedCount = 0;
      for (const incident of list) {
        if (incident.state === "open") openCount += 1;
        else if (incident.state === "acknowledged") acknowledgedCount += 1;
        else if (incident.state === "investigating") investigatingCount += 1;
        else if (incident.state === "escalated") escalatedCount += 1;
        else if (incident.state === "resolved") resolvedCount += 1;
        else if (incident.state === "closed") closedCount += 1;
      }
      return {
        at: clock,
        incidentCount: list.length,
        openCount,
        acknowledgedCount,
        investigatingCount,
        escalatedCount,
        resolvedCount,
        closedCount,
        policy: clonePolicy(policy),
        incidents: list,
      };
    },

    reset(): void {
      statusState = "idle";
      clock = 0;
      seq = 0;
      policy = clonePolicy(DEFAULT_INCIDENT_POLICY);
      incidents.clear();
    },
  };
}

/** Public enum surfaces for stable consumer imports. */
export const INCIDENT_MANAGEMENT_PUBLIC_ENUMS = {
  severity: INCIDENT_SEVERITIES,
  state: INCIDENT_RESOLUTION_STATES,
  escalationLevel: INCIDENT_ESCALATION_LEVELS,
} as const;
