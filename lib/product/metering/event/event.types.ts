/**
 * Product Metering — Event types
 */

export type EventMetadata = Record<string, unknown>;

export type UsageEvent = {
  id: string;
  meterId: string;
  accountId: string;
  quantity: number;
  detail: string;
  metadata: EventMetadata;
  recordedAt: string;
};

export type RecordUsageEventInput = {
  id?: string;
  meterId: string;
  accountId: string;
  quantity: number;
  metadata?: EventMetadata;
};
