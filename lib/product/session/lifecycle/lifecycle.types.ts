/**
 * Product Session — Lifecycle types
 */

import type { SESSION_LIFECYCLE_STATUSES } from "../control/control.constants";

export type SessionLifecycleStatus =
  (typeof SESSION_LIFECYCLE_STATUSES)[number];
export type SessionLifecycleMetadata = Record<string, unknown>;

export type ControlledSession = {
  id: string;
  principalId: string;
  authId: string;
  status: SessionLifecycleStatus;
  detail: string;
  metadata: SessionLifecycleMetadata;
  openedAt: string;
  refreshedAt?: string;
  closedAt?: string;
};

export type OpenControlledSessionInput = {
  id?: string;
  principalId: string;
  authId: string;
  metadata?: SessionLifecycleMetadata;
};

export type RefreshSessionInput = {
  sessionId: string;
};

export type CloseControlledSessionInput = {
  sessionId: string;
  status?: "EXPIRED" | "REVOKED";
};
