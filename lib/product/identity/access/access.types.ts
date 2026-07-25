/**
 * Product Identity — Access types
 */

import type { ACCESS_DECISIONS } from "../authentication/authentication.constants";

export type AccessDecision = (typeof ACCESS_DECISIONS)[number];
export type AccessMetadata = Record<string, unknown>;

export type AccessEvaluation = {
  id: string;
  principalId: string;
  resource: string;
  action: string;
  decision: AccessDecision;
  detail: string;
  metadata: AccessMetadata;
  evaluatedAt: string;
};

export type EvaluateAccessInput = {
  id?: string;
  principalId: string;
  resource: string;
  action: string;
  decision?: AccessDecision;
  metadata?: AccessMetadata;
};
