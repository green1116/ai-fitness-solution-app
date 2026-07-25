/**
 * Product P4 — Constraint registry
 */

import { CONSTRAINT_KINDS } from "../questionnaire/questionnaire.constants";
import type {
  CaptureConstraintInput,
  ConstraintKind,
  ProjectConstraint,
} from "./constraint.types";

const constraints = new Map<string, ProjectConstraint>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clamp(value: number): number {
  return Math.max(1, Math.min(5, Math.round(value)));
}

function cloneConstraint(constraint: ProjectConstraint): ProjectConstraint {
  return { ...constraint, metadata: { ...constraint.metadata } };
}

export function captureConstraint(
  input: CaptureConstraintInput,
): ProjectConstraint {
  const projectRef = input.projectRef.trim();
  const title = input.title.trim();
  const description = input.description.trim();
  if (!projectRef) throw new Error("constraint.projectRef is required");
  if (!title) throw new Error("constraint.title is required");
  if (!description) throw new Error("constraint.description is required");
  if (!(CONSTRAINT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid constraint kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.severity)) {
    throw new Error("constraint.severity must be a number");
  }

  const id = input.id?.trim() || createId("p4cst");
  if (constraints.has(id)) {
    throw new Error(`constraint already exists: ${id}`);
  }

  const severity = clamp(input.severity);
  const constraint: ProjectConstraint = {
    id,
    projectRef,
    kind: input.kind,
    title,
    description,
    severity,
    detail: `kind=${input.kind} severity=${severity}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  constraints.set(id, constraint);
  return cloneConstraint(constraint);
}

export function getConstraint(id: string): ProjectConstraint | undefined {
  const constraint = constraints.get(id.trim());
  return constraint ? cloneConstraint(constraint) : undefined;
}

export function listConstraints(filter?: {
  projectRef?: string;
  kind?: ConstraintKind;
}): ProjectConstraint[] {
  let result = [...constraints.values()];
  if (filter?.projectRef) {
    const pref = filter.projectRef.trim();
    result = result.filter((c) => c.projectRef === pref);
  }
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneConstraint);
}

export function clearConstraints(): void {
  constraints.clear();
}
