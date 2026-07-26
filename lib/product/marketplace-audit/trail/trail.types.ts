/**
 * Product Marketplace Audit — Trail types
 */

import type { MARKETPLACE_AUDIT_TRAIL_STATUSES } from "../management/management.constants";

export type MarketplaceAuditTrailStatus =
  (typeof MARKETPLACE_AUDIT_TRAIL_STATUSES)[number];
export type TrailMetadata = Record<string, unknown>;

export type MarketplaceAuditTrail = {
  id: string;
  eventId: string;
  status: MarketplaceAuditTrailStatus;
  sequence: number;
  detail: string;
  metadata: TrailMetadata;
  createdAt: string;
  updatedAt: string;
};

export type AppendMarketplaceAuditTrailInput = {
  id?: string;
  eventId: string;
  sequence: number;
  metadata?: TrailMetadata;
};

export type SealMarketplaceAuditTrailInput = {
  trailId: string;
};
