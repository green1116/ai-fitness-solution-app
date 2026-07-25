/**
 * Product Customer Insight — Segment types
 */

import type { INSIGHT_SEGMENT_CODES } from "../insight/insight.constants";

export type InsightSegmentCode = (typeof INSIGHT_SEGMENT_CODES)[number];
export type SegmentMetadata = Record<string, unknown>;

export type CustomerInsightSegment = {
  id: string;
  customerId: string;
  segment: InsightSegmentCode;
  detail: string;
  metadata: SegmentMetadata;
  assignedAt: string;
};

export type AssignInsightSegmentInput = {
  id?: string;
  customerId: string;
  segment: InsightSegmentCode;
  metadata?: SegmentMetadata;
};
