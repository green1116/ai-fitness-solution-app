/**
 * Launch L2 — Intake workflow
 */

import { INTAKE_STATUSES } from "../pilot/pilot.constants";
import { getIntakeForm, setIntakeForm } from "./intake.form";
import type {
  AdvanceIntakeInput,
  IntakeForm,
  IntakeStatus,
} from "./intake.types";

const ALLOWED: Record<IntakeStatus, readonly IntakeStatus[]> = {
  OPEN: ["SUBMITTED", "REJECTED"],
  SUBMITTED: ["REVIEWED", "REJECTED"],
  REVIEWED: ["APPROVED", "REJECTED"],
  APPROVED: [],
  REJECTED: [],
};

function nowIso(): string {
  return new Date().toISOString();
}

function cloneForm(form: IntakeForm): IntakeForm {
  return {
    ...form,
    goals: [...form.goals],
    metadata: { ...form.metadata },
  };
}

export function advanceIntakeWorkflow(
  input: AdvanceIntakeInput,
): IntakeForm {
  const formId = input.formId.trim();
  if (!formId) throw new Error("intake.formId is required");

  const allowedStates: ReadonlyArray<Exclude<IntakeStatus, "OPEN">> = [
    "SUBMITTED",
    "REVIEWED",
    "APPROVED",
    "REJECTED",
  ];
  if (!allowedStates.includes(input.status)) {
    throw new Error(`invalid intake advance status: ${input.status}`);
  }
  if (!(INTAKE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid intake status: ${input.status}`);
  }

  const current = getIntakeForm(formId);
  if (!current) throw new Error(`intake form not found: ${formId}`);

  const allowed = ALLOWED[current.status];
  if (!allowed.includes(input.status)) {
    throw new Error(
      `invalid intake transition ${current.status} -> ${input.status}`,
    );
  }

  const note = (input.note ?? "").trim();
  const updated: IntakeForm = {
    ...current,
    status: input.status,
    detail: note
      ? `status=${input.status} note=${note}`
      : `status=${input.status} contact=${current.contactEmail}`,
    updatedAt: nowIso(),
  };
  setIntakeForm(updated);
  return cloneForm(updated);
}
