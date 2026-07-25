/**
 * Product Analytics Audit — Query types
 */

import type { AnalyticsAuditCategory } from "../event/event.types";

export type QueryMetadata = Record<string, unknown>;

export type AnalyticsAuditQuery = {
  id: string;
  category?: AnalyticsAuditCategory;
  subjectId?: string;
  matchCount: number;
  matchedEventIds: string[];
  detail: string;
  metadata: QueryMetadata;
  queriedAt: string;
};

export type QueryAnalyticsAuditInput = {
  id?: string;
  category?: AnalyticsAuditCategory;
  subjectId?: string;
  metadata?: QueryMetadata;
};
