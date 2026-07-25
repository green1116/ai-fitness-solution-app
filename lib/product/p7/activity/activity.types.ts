/**
 * Product P7 — Activity types
 */

import type { ACTIVITY_KINDS } from "../collaboration/collaboration.constants";

export type ActivityKind = (typeof ACTIVITY_KINDS)[number];
export type ActivityMetadata = Record<string, unknown>;

export type CollaborationActivity = {
  id: string;
  collaborationId: string;
  kind: ActivityKind;
  actor: string;
  summary: string;
  detail: string;
  metadata: ActivityMetadata;
  recordedAt: string;
};

export type RecordActivityInput = {
  id?: string;
  collaborationId: string;
  kind: ActivityKind;
  actor: string;
  summary: string;
  metadata?: ActivityMetadata;
};
