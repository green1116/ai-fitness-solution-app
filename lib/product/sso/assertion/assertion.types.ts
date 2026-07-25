/**
 * Product SSO — Assertion types
 */

import type { SSO_ASSERTION_RESULTS } from "../federation/federation.constants";

export type SsoAssertionResult = (typeof SSO_ASSERTION_RESULTS)[number];
export type AssertionMetadata = Record<string, unknown>;

export type SsoAssertion = {
  id: string;
  providerId: string;
  connectionId: string;
  principalId: string;
  externalSubject: string;
  result: SsoAssertionResult;
  detail: string;
  metadata: AssertionMetadata;
  assertedAt: string;
};

export type FederateAssertionInput = {
  id?: string;
  providerId: string;
  externalSubject: string;
  accept?: boolean;
  metadata?: AssertionMetadata;
};
