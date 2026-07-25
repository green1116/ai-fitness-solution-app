/**
 * Product Audit — Query types
 */

import type { AuditEventCategory } from "../event/event.types";

export type QueryMetadata = Record<string, unknown>;

export type AuditQuery = {
  id: string;
  category?: AuditEventCategory;
  actorId?: string;
  matchCount: number;
  matchedEventIds: string[];
  detail: string;
  metadata: QueryMetadata;
  queriedAt: string;
};

export type QueryAuditTrailInput = {
  id?: string;
  category?: AuditEventCategory;
  actorId?: string;
  metadata?: QueryMetadata;
};
