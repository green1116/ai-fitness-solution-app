/**
 * Product P4 — Stakeholder registry
 */

import { STAKEHOLDER_ROLES } from "../questionnaire/questionnaire.constants";
import type {
  RegisterStakeholderInput,
  Stakeholder,
  StakeholderRole,
} from "./stakeholder.types";

const stakeholders = new Map<string, Stakeholder>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneStakeholder(stakeholder: Stakeholder): Stakeholder {
  return { ...stakeholder, metadata: { ...stakeholder.metadata } };
}

export function registerStakeholder(
  input: RegisterStakeholderInput,
): Stakeholder {
  const projectRef = input.projectRef.trim();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  if (!projectRef) throw new Error("stakeholder.projectRef is required");
  if (!name) throw new Error("stakeholder.name is required");
  if (!email) throw new Error("stakeholder.email is required");
  if (!(STAKEHOLDER_ROLES as readonly string[]).includes(input.role)) {
    throw new Error(`invalid stakeholder role: ${input.role}`);
  }

  const id = input.id?.trim() || createId("p4stk");
  if (stakeholders.has(id)) {
    throw new Error(`stakeholder already exists: ${id}`);
  }

  const stakeholder: Stakeholder = {
    id,
    projectRef,
    name,
    email,
    role: input.role,
    detail: `role=${input.role} email=${email}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  stakeholders.set(id, stakeholder);
  return cloneStakeholder(stakeholder);
}

export function getStakeholder(id: string): Stakeholder | undefined {
  const stakeholder = stakeholders.get(id.trim());
  return stakeholder ? cloneStakeholder(stakeholder) : undefined;
}

export function listStakeholders(filter?: {
  projectRef?: string;
  role?: StakeholderRole;
}): Stakeholder[] {
  let result = [...stakeholders.values()];
  if (filter?.projectRef) {
    const pref = filter.projectRef.trim();
    result = result.filter((s) => s.projectRef === pref);
  }
  if (filter?.role) result = result.filter((s) => s.role === filter.role);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneStakeholder);
}

export function clearStakeholders(): void {
  stakeholders.clear();
}
