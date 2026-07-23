/**
 * Launch L2 — Pilot status transitions
 */

import { PILOT_STATUSES } from "./pilot.constants";
import { getPilot, setPilotRecord } from "./pilot.registry";
import type {
  PilotRecord,
  PilotStatus,
  UpdatePilotStatusInput,
} from "./pilot.types";

const ALLOWED: Record<PilotStatus, readonly PilotStatus[]> = {
  DRAFT: ["INTAKE", "CLOSED"],
  INTAKE: ["ACTIVE", "CLOSED"],
  ACTIVE: ["ACCEPTED", "CLOSED"],
  ACCEPTED: ["CLOSED"],
  CLOSED: [],
};

function nowIso(): string {
  return new Date().toISOString();
}

function clonePilot(pilot: PilotRecord): PilotRecord {
  return { ...pilot, metadata: { ...pilot.metadata } };
}

export function updatePilotStatus(
  input: UpdatePilotStatusInput,
): PilotRecord {
  const pilotId = input.pilotId.trim();
  if (!pilotId) throw new Error("pilotStatus.pilotId is required");
  if (!(PILOT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid pilot status: ${input.status}`);
  }

  const current = getPilot(pilotId);
  if (!current) throw new Error(`pilot not found: ${pilotId}`);

  const allowed = ALLOWED[current.status];
  if (!allowed.includes(input.status)) {
    throw new Error(
      `invalid pilot transition ${current.status} -> ${input.status}`,
    );
  }

  const note = (input.note ?? "").trim();
  const updated: PilotRecord = {
    ...current,
    status: input.status,
    detail: note
      ? `status=${input.status} note=${note}`
      : `status=${input.status} account=${current.accountRef}`,
    updatedAt: nowIso(),
  };
  setPilotRecord(updated);
  return clonePilot(updated);
}

export function listAllowedPilotTransitions(
  status: PilotStatus,
): PilotStatus[] {
  if (!(PILOT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid pilot status: ${status}`);
  }
  return [...ALLOWED[status]];
}
