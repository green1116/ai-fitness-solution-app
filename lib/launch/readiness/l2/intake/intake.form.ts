/**
 * Launch L2 — Intake form
 */

import { INTAKE_STATUSES } from "../pilot/pilot.constants";
import { getPilot } from "../pilot/pilot.registry";
import type {
  CreateIntakeFormInput,
  IntakeForm,
  IntakeStatus,
} from "./intake.types";

const forms = new Map<string, IntakeForm>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneForm(form: IntakeForm): IntakeForm {
  return {
    ...form,
    goals: [...form.goals],
    metadata: { ...form.metadata },
  };
}

export function createIntakeForm(input: CreateIntakeFormInput): IntakeForm {
  const pilotId = input.pilotId.trim();
  const contactName = input.contactName.trim();
  const contactEmail = input.contactEmail.trim().toLowerCase();
  if (!pilotId) throw new Error("intake.pilotId is required");
  if (!contactName) throw new Error("intake.contactName is required");
  if (!contactEmail) throw new Error("intake.contactEmail is required");
  if (!getPilot(pilotId)) {
    throw new Error(`pilot not found: ${pilotId}`);
  }

  const goals = (input.goals ?? [])
    .map((g) => g.trim())
    .filter((g) => g.length > 0);
  const id = input.id?.trim() || createId("l2int");
  if (forms.has(id)) {
    throw new Error(`intake form already exists: ${id}`);
  }

  const status: IntakeStatus = "OPEN";
  if (!(INTAKE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid intake status: ${status}`);
  }

  const now = nowIso();
  const form: IntakeForm = {
    id,
    pilotId,
    contactName,
    contactEmail,
    goals,
    status,
    detail: `status=${status} contact=${contactEmail}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  forms.set(id, form);
  return cloneForm(form);
}

export function getIntakeForm(id: string): IntakeForm | undefined {
  const form = forms.get(id.trim());
  return form ? cloneForm(form) : undefined;
}

export function listIntakeForms(filter?: {
  pilotId?: string;
  status?: IntakeStatus;
}): IntakeForm[] {
  let result = [...forms.values()];
  if (filter?.pilotId) {
    const pid = filter.pilotId.trim();
    result = result.filter((f) => f.pilotId === pid);
  }
  if (filter?.status) result = result.filter((f) => f.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneForm);
}

export function setIntakeForm(form: IntakeForm): void {
  forms.set(form.id, form);
}

export function clearIntakeForms(): void {
  forms.clear();
}
