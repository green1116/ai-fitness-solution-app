/**
 * V57 P3 — Product analytics event model (no third-party)
 */

export const PRODUCT_ANALYTICS_EVENTS = [
  "user_signup",
  "workspace_entered",
  "project_created",
  "quote_generated",
  "quote_viewed",
  "pdf_downloaded",
] as const;

export type ProductAnalyticsEventName = (typeof PRODUCT_ANALYTICS_EVENTS)[number];

export type ProductAnalyticsPayload = {
  event: ProductAnalyticsEventName;
  userId?: string;
  organizationId?: string;
  projectId?: string;
  quoteId?: string;
  meta?: Record<string, unknown>;
  timestamp: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __productAnalyticsLog: ProductAnalyticsPayload[] | undefined;
}

function logStore(): ProductAnalyticsPayload[] {
  globalThis.__productAnalyticsLog ||= [];
  return globalThis.__productAnalyticsLog;
}

export function recordProductAnalytics(input: Omit<ProductAnalyticsPayload, "timestamp">): ProductAnalyticsPayload {
  const entry: ProductAnalyticsPayload = {
    ...input,
    timestamp: new Date().toISOString(),
  };
  logStore().push(entry);
  if (logStore().length > 5000) logStore().splice(0, logStore().length - 5000);
  return entry;
}

export function getProductAnalyticsSnapshot(limit = 100): ProductAnalyticsPayload[] {
  return logStore().slice(-limit);
}

export function countProductAnalyticsEvent(
  event: ProductAnalyticsEventName,
  organizationId?: string,
): number {
  return logStore().filter(
    (e) => e.event === event && (!organizationId || e.organizationId === organizationId),
  ).length;
}
