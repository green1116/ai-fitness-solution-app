/**
 * Launch L2 — Intake types
 */

import type { INTAKE_STATUSES } from "../pilot/pilot.constants";

export type IntakeStatus = (typeof INTAKE_STATUSES)[number];
export type IntakeMetadata = Record<string, unknown>;

export type IntakeForm = {
  id: string;
  pilotId: string;
  contactName: string;
  contactEmail: string;
  goals: string[];
  status: IntakeStatus;
  detail: string;
  metadata: IntakeMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateIntakeFormInput = {
  id?: string;
  pilotId: string;
  contactName: string;
  contactEmail: string;
  goals?: string[];
  metadata?: IntakeMetadata;
};

export type AdvanceIntakeInput = {
  formId: string;
  status: Exclude<IntakeStatus, "OPEN">;
  note?: string;
};
