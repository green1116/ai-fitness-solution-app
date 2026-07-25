/**
 * Product MFA — Enrollment registry
 */

import {
  MFA_ENROLLMENT_STATUSES,
  MFA_FACTOR_KINDS,
} from "../factor/factor.constants";
import type {
  ActivateEnrollmentInput,
  DisableEnrollmentInput,
  EnrollFactorInput,
  MfaEnrollment,
  MfaEnrollmentStatus,
  MfaFactorKind,
} from "./enrollment.types";

const enrollments = new Map<string, MfaEnrollment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEnrollment(enrollment: MfaEnrollment): MfaEnrollment {
  return { ...enrollment, metadata: { ...enrollment.metadata } };
}

export function enrollFactor(input: EnrollFactorInput): MfaEnrollment {
  const principalId = input.principalId.trim();
  const label = input.label.trim();
  if (!principalId) throw new Error("enrollment.principalId is required");
  if (!label) throw new Error("enrollment.label is required");
  if (!(MFA_FACTOR_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid mfa factor kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("mfaenr");
  if (enrollments.has(id)) {
    throw new Error(`enrollment already exists: ${id}`);
  }

  const status = MFA_ENROLLMENT_STATUSES[0];
  const enrollment: MfaEnrollment = {
    id,
    principalId,
    kind: input.kind,
    status,
    label,
    detail: `kind=${input.kind} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    enrolledAt: nowIso(),
  };
  enrollments.set(id, enrollment);
  return cloneEnrollment(enrollment);
}

export function activateEnrollment(
  input: ActivateEnrollmentInput,
): MfaEnrollment {
  const enrollmentId = input.enrollmentId.trim();
  if (!enrollmentId) throw new Error("enrollment.enrollmentId is required");
  const existing = enrollments.get(enrollmentId);
  if (!existing) throw new Error(`enrollment not found: ${enrollmentId}`);
  if (existing.status === "ACTIVE") {
    throw new Error(`enrollment already active: ${enrollmentId}`);
  }
  if (existing.status === "DISABLED") {
    throw new Error(`enrollment disabled: ${enrollmentId}`);
  }

  const now = nowIso();
  const updated: MfaEnrollment = {
    ...existing,
    status: "ACTIVE",
    detail: `kind=${existing.kind} status=ACTIVE`,
    metadata: { ...existing.metadata },
    activatedAt: now,
  };
  enrollments.set(enrollmentId, updated);
  return cloneEnrollment(updated);
}

export function disableEnrollment(
  input: DisableEnrollmentInput,
): MfaEnrollment {
  const enrollmentId = input.enrollmentId.trim();
  if (!enrollmentId) throw new Error("enrollment.enrollmentId is required");
  const existing = enrollments.get(enrollmentId);
  if (!existing) throw new Error(`enrollment not found: ${enrollmentId}`);
  if (existing.status === "DISABLED") {
    throw new Error(`enrollment already disabled: ${enrollmentId}`);
  }

  const updated: MfaEnrollment = {
    ...existing,
    status: "DISABLED",
    detail: `kind=${existing.kind} status=DISABLED`,
    metadata: { ...existing.metadata },
  };
  enrollments.set(enrollmentId, updated);
  return cloneEnrollment(updated);
}

export function getEnrollment(id: string): MfaEnrollment | undefined {
  const enrollment = enrollments.get(id.trim());
  return enrollment ? cloneEnrollment(enrollment) : undefined;
}

export function listEnrollments(filter?: {
  principalId?: string;
  kind?: MfaFactorKind;
  status?: MfaEnrollmentStatus;
}): MfaEnrollment[] {
  let result = [...enrollments.values()];
  if (filter?.principalId) {
    const pid = filter.principalId.trim();
    result = result.filter((e) => e.principalId === pid);
  }
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((e) => e.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEnrollment);
}

export function clearEnrollments(): void {
  enrollments.clear();
}
