/**
 * Product Billing Audit — Query types
 */

import type { BillingAuditCategory } from "../event/event.types";

export type QueryMetadata = Record<string, unknown>;

export type BillingAuditQuery = {
  id: string;
  category?: BillingAuditCategory;
  accountId?: string;
  matchCount: number;
  matchedEventIds: string[];
  detail: string;
  metadata: QueryMetadata;
  queriedAt: string;
};

export type QueryBillingAuditInput = {
  id?: string;
  category?: BillingAuditCategory;
  accountId?: string;
  metadata?: QueryMetadata;
};
