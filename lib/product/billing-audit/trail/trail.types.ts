/**
 * Product Billing Audit — Trail types
 */

import type { BILLING_TRAIL_STATUSES } from "../traceability/traceability.constants";

export type BillingTrailStatus = (typeof BILLING_TRAIL_STATUSES)[number];
export type TrailMetadata = Record<string, unknown>;

export type BillingAuditTrail = {
  id: string;
  eventId: string;
  sequence: number;
  status: BillingTrailStatus;
  detail: string;
  metadata: TrailMetadata;
  appendedAt: string;
};

export type AppendBillingTrailInput = {
  id?: string;
  eventId: string;
  metadata?: TrailMetadata;
};

export type MarkBillingTrailStatusInput = {
  trailId: string;
  status: "SEALED" | "EXPORTED";
};
