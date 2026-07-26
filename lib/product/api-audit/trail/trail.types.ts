/**
 * Product API Audit — Trail types
 */

import type { API_AUDIT_TRAIL_STATUSES } from "../management/management.constants";

export type ApiAuditTrailStatus = (typeof API_AUDIT_TRAIL_STATUSES)[number];
export type TrailMetadata = Record<string, unknown>;

export type ApiAuditTrail = {
  id: string;
  eventId: string;
  status: ApiAuditTrailStatus;
  sequence: number;
  detail: string;
  metadata: TrailMetadata;
  createdAt: string;
  updatedAt: string;
};

export type AppendApiAuditTrailInput = {
  id?: string;
  eventId: string;
  sequence: number;
  metadata?: TrailMetadata;
};

export type SealApiAuditTrailInput = {
  trailId: string;
};
