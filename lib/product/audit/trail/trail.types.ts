/**
 * Product Audit — Trail types
 */

import type { AUDIT_TRAIL_STATUSES } from "../security/security.constants";

export type AuditTrailStatus = (typeof AUDIT_TRAIL_STATUSES)[number];
export type TrailMetadata = Record<string, unknown>;

export type AuditTrailEntry = {
  id: string;
  eventId: string;
  sequence: number;
  status: AuditTrailStatus;
  detail: string;
  metadata: TrailMetadata;
  appendedAt: string;
};

export type AppendTrailInput = {
  id?: string;
  eventId: string;
  metadata?: TrailMetadata;
};

export type MarkTrailStatusInput = {
  trailId: string;
  status: "SEALED" | "EXPORTED";
};
