/**
 * Product MFA — Assertion types
 */

import type { MFA_ASSERTION_RESULTS } from "../factor/factor.constants";

export type MfaAssertionResult = (typeof MFA_ASSERTION_RESULTS)[number];
export type AssertionMetadata = Record<string, unknown>;

export type MfaAssertion = {
  id: string;
  challengeId: string;
  principalId: string;
  enrollmentId: string;
  result: MfaAssertionResult;
  code: string;
  detail: string;
  metadata: AssertionMetadata;
  assertedAt: string;
};

export type AssertFactorInput = {
  id?: string;
  challengeId: string;
  code: string;
  expectedCode?: string;
  metadata?: AssertionMetadata;
};
