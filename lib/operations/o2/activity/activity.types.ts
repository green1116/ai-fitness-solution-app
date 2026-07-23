/**
 * Operations O2 — Activity types
 */

import type { ACTIVITY_EVENT_KINDS } from "../usage/usage.constants";

export type ActivityEventKind = (typeof ACTIVITY_EVENT_KINDS)[number];
export type ActivityMetadata = Record<string, unknown>;

export type ActivityEvent = {
  id: string;
  accountRef: string;
  kind: ActivityEventKind;
  actor: string;
  message: string;
  detail: string;
  metadata: ActivityMetadata;
  recordedAt: string;
};

export type RecordActivityEventInput = {
  id?: string;
  accountRef: string;
  kind: ActivityEventKind;
  actor: string;
  message: string;
  metadata?: ActivityMetadata;
};

export type ActivityAnalytics = {
  id: string;
  accountRef: string;
  eventCount: number;
  loginCount: number;
  featureUseCount: number;
  intensityScore: number;
  detail: string;
  analyzedAt: string;
};

export type AnalyzeActivityInput = {
  id?: string;
  accountRef: string;
};
