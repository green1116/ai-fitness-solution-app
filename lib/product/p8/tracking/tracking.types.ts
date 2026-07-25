/**
 * Product P8 — Tracking types
 */

import type { TRACKING_EVENTS } from "../tender/tender.constants";

export type TrackingEventKind = (typeof TRACKING_EVENTS)[number];
export type TrackingMetadata = Record<string, unknown>;

export type TenderTrackingEvent = {
  id: string;
  tenderId: string;
  kind: TrackingEventKind;
  message: string;
  detail: string;
  metadata: TrackingMetadata;
  recordedAt: string;
};

export type RecordTrackingInput = {
  id?: string;
  tenderId: string;
  kind: TrackingEventKind;
  message: string;
  metadata?: TrackingMetadata;
};
