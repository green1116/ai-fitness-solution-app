/**
 * Product Notification Audit — Query types
 */

export type QueryMetadata = Record<string, unknown>;

export type NotificationAuditQuery = {
  id: string;
  queryKey: string;
  category?: string;
  subjectKey?: string;
  matchedEventIds: string[];
  detail: string;
  metadata: QueryMetadata;
  createdAt: string;
};

export type RunNotificationAuditQueryInput = {
  id?: string;
  queryKey: string;
  category?: string;
  subjectKey?: string;
  metadata?: QueryMetadata;
};
