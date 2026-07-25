/**
 * Product Authorization — Decision types
 */

import type { DECISION_RESULTS } from "../rbac/rbac.constants";

export type DecisionResult = (typeof DECISION_RESULTS)[number];
export type DecisionMetadata = Record<string, unknown>;

export type AuthorizationDecision = {
  id: string;
  principalId: string;
  resource: string;
  action: string;
  result: DecisionResult;
  matchedPermissionId?: string;
  matchedRoleId?: string;
  detail: string;
  metadata: DecisionMetadata;
  decidedAt: string;
};

export type AuthorizeInput = {
  id?: string;
  principalId: string;
  resource: string;
  action: string;
  metadata?: DecisionMetadata;
};
