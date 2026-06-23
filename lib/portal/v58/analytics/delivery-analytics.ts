/**
 * V58 — Delivery analytics (extends product analytics pattern)
 */

export const DELIVERY_ANALYTICS_EVENTS = [
  "document_viewed",
  "pdf_downloaded",
  "delivery_created",
  "tender_pack_generated",
  "report_opened",
] as const;

export type DeliveryAnalyticsEventName = (typeof DELIVERY_ANALYTICS_EVENTS)[number];

export type DeliveryAnalyticsPayload = {
  event: DeliveryAnalyticsEventName;
  userId?: string;
  organizationId?: string;
  projectId?: string;
  quoteId?: string;
  deliveryId?: string;
  meta?: Record<string, unknown>;
  timestamp: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __v58DeliveryAnalyticsLog: DeliveryAnalyticsPayload[] | undefined;
}

function store(): DeliveryAnalyticsPayload[] {
  globalThis.__v58DeliveryAnalyticsLog ||= [];
  return globalThis.__v58DeliveryAnalyticsLog;
}

export function recordDeliveryAnalytics(
  input: Omit<DeliveryAnalyticsPayload, "timestamp">,
): DeliveryAnalyticsPayload {
  const entry: DeliveryAnalyticsPayload = {
    ...input,
    timestamp: new Date().toISOString(),
  };
  store().push(entry);
  if (store().length > 5000) store().splice(0, store().length - 5000);
  return entry;
}

export function getDeliveryAnalyticsSnapshot(limit = 100): DeliveryAnalyticsPayload[] {
  return store().slice(-limit);
}
