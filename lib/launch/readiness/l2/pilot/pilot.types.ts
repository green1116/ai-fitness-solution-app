/**
 * Launch L2 — Pilot types
 */

import type { PILOT_STATUSES } from "./pilot.constants";

export type PilotStatus = (typeof PILOT_STATUSES)[number];
export type PilotMetadata = Record<string, unknown>;

export type PilotRecord = {
  id: string;
  name: string;
  accountRef: string;
  owner: string;
  status: PilotStatus;
  detail: string;
  metadata: PilotMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPilotInput = {
  id?: string;
  name: string;
  accountRef: string;
  owner: string;
  status?: PilotStatus;
  metadata?: PilotMetadata;
};

export type UpdatePilotStatusInput = {
  pilotId: string;
  status: PilotStatus;
  note?: string;
};
