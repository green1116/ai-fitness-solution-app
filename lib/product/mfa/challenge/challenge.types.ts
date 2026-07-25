/**
 * Product MFA — Challenge types
 */

import type { MFA_CHALLENGE_STATUSES } from "../factor/factor.constants";
import type { MfaFactorKind } from "../enrollment/enrollment.types";

export type MfaChallengeStatus = (typeof MFA_CHALLENGE_STATUSES)[number];
export type ChallengeMetadata = Record<string, unknown>;

export type MfaChallenge = {
  id: string;
  principalId: string;
  enrollmentId: string;
  kind: MfaFactorKind;
  status: MfaChallengeStatus;
  sessionId?: string;
  detail: string;
  metadata: ChallengeMetadata;
  issuedAt: string;
  resolvedAt?: string;
};

export type IssueChallengeInput = {
  id?: string;
  principalId: string;
  enrollmentId: string;
  sessionId?: string;
  metadata?: ChallengeMetadata;
};

export type ResolveChallengeInput = {
  challengeId: string;
  status: "SATISFIED" | "EXPIRED" | "FAILED";
};
