/**
 * Product Admin Audit — Trail types
 */

import type { ADMIN_TRAIL_STATUSES } from "../traceability/traceability.constants";

export type AdminTrailStatus = (typeof ADMIN_TRAIL_STATUSES)[number];
export type TrailMetadata = Record<string, unknown>;

export type AdminAuditTrail = {
  id: string;
  eventId: string;
  sequence: number;
  status: AdminTrailStatus;
  detail: string;
  metadata: TrailMetadata;
  appendedAt: string;
};

export type AppendAdminTrailInput = {
  id?: string;
  eventId: string;
  metadata?: TrailMetadata;
};

export type MarkAdminTrailStatusInput = {
  trailId: string;
  status: "SEALED" | "EXPORTED";
};
