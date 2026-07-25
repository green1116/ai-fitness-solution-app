/**
 * Product MFA — Assertion registry
 */

import {
  getChallenge,
  resolveChallenge,
} from "../challenge/challenge.registry";
import type {
  AssertFactorInput,
  MfaAssertion,
  MfaAssertionResult,
} from "./assertion.types";

const assertions = new Map<string, MfaAssertion>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAssertion(assertion: MfaAssertion): MfaAssertion {
  return { ...assertion, metadata: { ...assertion.metadata } };
}

export function assertFactor(input: AssertFactorInput): MfaAssertion {
  const challengeId = input.challengeId.trim();
  const code = input.code.trim();
  if (!challengeId) throw new Error("assertion.challengeId is required");
  if (!code) throw new Error("assertion.code is required");

  const challenge = getChallenge(challengeId);
  if (!challenge) throw new Error(`challenge not found: ${challengeId}`);
  if (challenge.status !== "OPEN") {
    throw new Error(`challenge not open: ${challengeId}`);
  }

  const expected = (input.expectedCode ?? code).trim();
  const result: MfaAssertionResult = code === expected ? "PASS" : "FAIL";

  if (result === "PASS") {
    resolveChallenge({ challengeId, status: "SATISFIED" });
  } else {
    resolveChallenge({ challengeId, status: "FAILED" });
  }

  const id = input.id?.trim() || createId("mfaast");
  if (assertions.has(id)) throw new Error(`assertion already exists: ${id}`);

  const assertion: MfaAssertion = {
    id,
    challengeId,
    principalId: challenge.principalId,
    enrollmentId: challenge.enrollmentId,
    result,
    code,
    detail: `result=${result} challenge=${challengeId}`,
    metadata: { ...(input.metadata ?? {}) },
    assertedAt: nowIso(),
  };
  assertions.set(id, assertion);
  return cloneAssertion(assertion);
}

export function getAssertion(id: string): MfaAssertion | undefined {
  const assertion = assertions.get(id.trim());
  return assertion ? cloneAssertion(assertion) : undefined;
}

export function listAssertions(filter?: {
  principalId?: string;
  result?: MfaAssertionResult;
}): MfaAssertion[] {
  let result = [...assertions.values()];
  if (filter?.principalId) {
    const pid = filter.principalId.trim();
    result = result.filter((a) => a.principalId === pid);
  }
  if (filter?.result) {
    result = result.filter((a) => a.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAssertion);
}

export function clearAssertions(): void {
  assertions.clear();
}
