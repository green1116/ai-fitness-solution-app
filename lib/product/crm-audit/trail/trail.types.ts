/**
 * Product CRM Audit — Trail types
 */

import type { CRM_TRAIL_STATUSES } from "../traceability/traceability.constants";

export type CrmTrailStatus = (typeof CRM_TRAIL_STATUSES)[number];
export type TrailMetadata = Record<string, unknown>;

export type CrmAuditTrail = {
  id: string;
  eventId: string;
  sequence: number;
  status: CrmTrailStatus;
  detail: string;
  metadata: TrailMetadata;
  appendedAt: string;
};

export type AppendCrmTrailInput = {
  id?: string;
  eventId: string;
  metadata?: TrailMetadata;
};

export type MarkCrmTrailStatusInput = {
  trailId: string;
  status: "SEALED" | "EXPORTED";
};
