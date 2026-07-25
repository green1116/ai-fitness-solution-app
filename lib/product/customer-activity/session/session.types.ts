/**
 * Product Customer Activity — Session types
 */

import type { ACTIVITY_SESSION_STATUSES } from "../activity/activity.constants";

export type ActivitySessionStatus =
  (typeof ACTIVITY_SESSION_STATUSES)[number];
export type SessionMetadata = Record<string, unknown>;

export type CustomerActivitySession = {
  id: string;
  customerId: string;
  channel: string;
  status: ActivitySessionStatus;
  detail: string;
  metadata: SessionMetadata;
  openedAt: string;
  closedAt?: string;
};

export type OpenActivitySessionInput = {
  id?: string;
  customerId: string;
  channel: string;
  metadata?: SessionMetadata;
};

export type CloseActivitySessionInput = {
  sessionId: string;
};
