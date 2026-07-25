/**
 * Product MFA — Challenge registry
 */

import { MFA_CHALLENGE_STATUSES } from "../factor/factor.constants";
import { getEnrollment } from "../enrollment/enrollment.registry";
import type {
  IssueChallengeInput,
  MfaChallenge,
  MfaChallengeStatus,
  ResolveChallengeInput,
} from "./challenge.types";

const challenges = new Map<string, MfaChallenge>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneChallenge(challenge: MfaChallenge): MfaChallenge {
  return { ...challenge, metadata: { ...challenge.metadata } };
}

export function issueChallenge(input: IssueChallengeInput): MfaChallenge {
  const principalId = input.principalId.trim();
  const enrollmentId = input.enrollmentId.trim();
  if (!principalId) throw new Error("challenge.principalId is required");
  if (!enrollmentId) throw new Error("challenge.enrollmentId is required");

  const enrollment = getEnrollment(enrollmentId);
  if (!enrollment) throw new Error(`enrollment not found: ${enrollmentId}`);
  if (enrollment.principalId !== principalId) {
    throw new Error("challenge principal/enrollment mismatch");
  }
  if (enrollment.status !== "ACTIVE") {
    throw new Error(`enrollment not active: ${enrollmentId}`);
  }

  const id = input.id?.trim() || createId("mfachl");
  if (challenges.has(id)) throw new Error(`challenge already exists: ${id}`);

  const status = MFA_CHALLENGE_STATUSES[0];
  const challenge: MfaChallenge = {
    id,
    principalId,
    enrollmentId,
    kind: enrollment.kind,
    status,
    sessionId: input.sessionId?.trim() || undefined,
    detail: `kind=${enrollment.kind} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    issuedAt: nowIso(),
  };
  challenges.set(id, challenge);
  return cloneChallenge(challenge);
}

export function resolveChallenge(
  input: ResolveChallengeInput,
): MfaChallenge {
  const challengeId = input.challengeId.trim();
  if (!challengeId) throw new Error("challenge.challengeId is required");
  const existing = challenges.get(challengeId);
  if (!existing) throw new Error(`challenge not found: ${challengeId}`);
  if (existing.status !== "OPEN") {
    throw new Error(`challenge already resolved: ${challengeId}`);
  }
  if (
    input.status !== "SATISFIED" &&
    input.status !== "EXPIRED" &&
    input.status !== "FAILED"
  ) {
    throw new Error(`invalid challenge resolve status: ${input.status}`);
  }

  const updated: MfaChallenge = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    resolvedAt: nowIso(),
  };
  challenges.set(challengeId, updated);
  return cloneChallenge(updated);
}

export function getChallenge(id: string): MfaChallenge | undefined {
  const challenge = challenges.get(id.trim());
  return challenge ? cloneChallenge(challenge) : undefined;
}

export function listChallenges(filter?: {
  principalId?: string;
  status?: MfaChallengeStatus;
}): MfaChallenge[] {
  let result = [...challenges.values()];
  if (filter?.principalId) {
    const pid = filter.principalId.trim();
    result = result.filter((c) => c.principalId === pid);
  }
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneChallenge);
}

export function clearChallenges(): void {
  challenges.clear();
}
