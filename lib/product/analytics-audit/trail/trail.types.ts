/**
 * Product Analytics Audit — Trail types
 */

import type { ANALYTICS_TRAIL_STATUSES } from "../traceability/traceability.constants";

export type AnalyticsTrailStatus =
  (typeof ANALYTICS_TRAIL_STATUSES)[number];
export type TrailMetadata = Record<string, unknown>;

export type AnalyticsAuditTrail = {
  id: string;
  eventId: string;
  sequence: number;
  status: AnalyticsTrailStatus;
  detail: string;
  metadata: TrailMetadata;
  appendedAt: string;
};

export type AppendAnalyticsTrailInput = {
  id?: string;
  eventId: string;
  metadata?: TrailMetadata;
};

export type MarkAnalyticsTrailStatusInput = {
  trailId: string;
  status: "SEALED" | "EXPORTED";
};
