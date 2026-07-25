/**
 * Product Admin Audit — Query types
 */

import type { AdminAuditCategory } from "../event/event.types";

export type QueryMetadata = Record<string, unknown>;

export type AdminAuditQuery = {
  id: string;
  category?: AdminAuditCategory;
  subjectId?: string;
  matchCount: number;
  matchedEventIds: string[];
  detail: string;
  metadata: QueryMetadata;
  queriedAt: string;
};

export type QueryAdminAuditInput = {
  id?: string;
  category?: AdminAuditCategory;
  subjectId?: string;
  metadata?: QueryMetadata;
};
