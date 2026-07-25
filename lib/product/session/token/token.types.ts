/**
 * Product Session — Token flow types
 */

import type {
  TOKEN_FLOW_KINDS,
  TOKEN_FLOW_STATUSES,
} from "../control/control.constants";

export type TokenFlowKind = (typeof TOKEN_FLOW_KINDS)[number];
export type TokenFlowStatus = (typeof TOKEN_FLOW_STATUSES)[number];
export type TokenFlowMetadata = Record<string, unknown>;

export type FlowToken = {
  id: string;
  sessionId: string;
  principalId: string;
  kind: TokenFlowKind;
  status: TokenFlowStatus;
  value: string;
  detail: string;
  metadata: TokenFlowMetadata;
  issuedAt: string;
  rotatedAt?: string;
  revokedAt?: string;
};

export type IssueFlowTokenInput = {
  id?: string;
  sessionId: string;
  kind: TokenFlowKind;
  value?: string;
  metadata?: TokenFlowMetadata;
};

export type RotateTokenInput = {
  tokenId: string;
  value?: string;
};

export type RevokeTokenInput = {
  tokenId: string;
  status?: "REVOKED" | "EXPIRED";
};
