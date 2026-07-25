/**
 * Product Identity — Session types
 */

import type { SESSION_STATUSES } from "../authentication/authentication.constants";

export type SessionStatus = (typeof SESSION_STATUSES)[number];
export type SessionMetadata = Record<string, unknown>;

export type IdentitySession = {
  id: string;
  principalId: string;
  authId: string;
  status: SessionStatus;
  detail: string;
  metadata: SessionMetadata;
  openedAt: string;
  closedAt?: string;
};

export type OpenSessionInput = {
  id?: string;
  principalId: string;
  authId: string;
  metadata?: SessionMetadata;
};

export type CloseSessionInput = {
  sessionId: string;
  status?: "EXPIRED" | "REVOKED";
};
