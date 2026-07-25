/**
 * Product Customer Activity — Event types
 */

import type { ACTIVITY_EVENT_KINDS } from "../activity/activity.constants";

export type ActivityEventKind = (typeof ACTIVITY_EVENT_KINDS)[number];
export type EventMetadata = Record<string, unknown>;

export type CustomerActivityEvent = {
  id: string;
  customerId: string;
  kind: ActivityEventKind;
  summary: string;
  detail: string;
  metadata: EventMetadata;
  occurredAt: string;
};

export type RecordActivityEventInput = {
  id?: string;
  customerId: string;
  kind: ActivityEventKind;
  summary: string;
  metadata?: EventMetadata;
  occurredAt?: string;
};
