/**
 * Launch L2 — Pilot registry
 */

import { PILOT_STATUSES } from "./pilot.constants";
import type {
  PilotRecord,
  PilotStatus,
  RegisterPilotInput,
} from "./pilot.types";

const pilots = new Map<string, PilotRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePilot(pilot: PilotRecord): PilotRecord {
  return { ...pilot, metadata: { ...pilot.metadata } };
}

export function registerPilot(input: RegisterPilotInput): PilotRecord {
  const name = input.name.trim();
  const accountRef = input.accountRef.trim();
  const owner = input.owner.trim();
  if (!name) throw new Error("pilot.name is required");
  if (!accountRef) throw new Error("pilot.accountRef is required");
  if (!owner) throw new Error("pilot.owner is required");

  const status: PilotStatus = input.status ?? "DRAFT";
  if (!(PILOT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid pilot status: ${status}`);
  }

  const id = input.id?.trim() || createId("l2pil");
  if (pilots.has(id)) {
    throw new Error(`pilot already exists: ${id}`);
  }

  const now = nowIso();
  const pilot: PilotRecord = {
    id,
    name,
    accountRef,
    owner,
    status,
    detail: `status=${status} account=${accountRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  pilots.set(id, pilot);
  return clonePilot(pilot);
}

export function getPilot(id: string): PilotRecord | undefined {
  const pilot = pilots.get(id.trim());
  return pilot ? clonePilot(pilot) : undefined;
}

export function listPilots(filter?: {
  status?: PilotStatus;
  accountRef?: string;
}): PilotRecord[] {
  let result = [...pilots.values()];
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((p) => p.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePilot);
}

export function clearPilots(): void {
  pilots.clear();
}

export function setPilotRecord(pilot: PilotRecord): void {
  pilots.set(pilot.id, pilot);
}
