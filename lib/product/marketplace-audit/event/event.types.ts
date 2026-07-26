/**
 * Product Marketplace Audit — Event types
 */

import type {
  MARKETPLACE_AUDIT_CATEGORIES,
  MARKETPLACE_AUDIT_SEVERITIES,
} from "../management/management.constants";

export type MarketplaceAuditCategory =
  (typeof MARKETPLACE_AUDIT_CATEGORIES)[number];
export type MarketplaceAuditSeverity =
  (typeof MARKETPLACE_AUDIT_SEVERITIES)[number];
export type EventMetadata = Record<string, unknown>;

export type MarketplaceAuditEvent = {
  id: string;
  eventKey: string;
  category: MarketplaceAuditCategory;
  severity: MarketplaceAuditSeverity;
  subjectKey: string;
  governanceKeyRef: string;
  detail: string;
  metadata: EventMetadata;
  createdAt: string;
};

export type RecordMarketplaceAuditEventInput = {
  id?: string;
  eventKey: string;
  category: MarketplaceAuditCategory;
  severity: MarketplaceAuditSeverity;
  subjectKey: string;
  governanceKeyRef: string;
  detail: string;
  metadata?: EventMetadata;
};
