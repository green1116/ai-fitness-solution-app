/**
 * Product CRM Audit — Query types
 */

import type { CrmAuditCategory } from "../event/event.types";

export type QueryMetadata = Record<string, unknown>;

export type CrmAuditQuery = {
  id: string;
  category?: CrmAuditCategory;
  customerId?: string;
  matchCount: number;
  matchedEventIds: string[];
  detail: string;
  metadata: QueryMetadata;
  queriedAt: string;
};

export type QueryCrmAuditInput = {
  id?: string;
  category?: CrmAuditCategory;
  customerId?: string;
  metadata?: QueryMetadata;
};
