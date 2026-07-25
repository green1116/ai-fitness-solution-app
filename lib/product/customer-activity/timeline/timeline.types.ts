/**
 * Product Customer Activity — Timeline types
 */

import type { TIMELINE_ENTRY_KINDS } from "../activity/activity.constants";

export type TimelineEntryKind = (typeof TIMELINE_ENTRY_KINDS)[number];
export type TimelineMetadata = Record<string, unknown>;

export type CustomerActivityTimelineEntry = {
  id: string;
  customerId: string;
  kind: TimelineEntryKind;
  refId: string;
  title: string;
  detail: string;
  metadata: TimelineMetadata;
  recordedAt: string;
};

export type AppendTimelineEntryInput = {
  id?: string;
  customerId: string;
  kind: TimelineEntryKind;
  refId: string;
  title: string;
  metadata?: TimelineMetadata;
};
