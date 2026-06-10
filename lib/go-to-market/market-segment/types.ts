import type { GO_TO_MARKET_VERSION, ReadinessStubMode } from "../shared/types";

export const MARKET_SEGMENT_RUNTIME_VERSION = "v17.0-market-segment-1" as const;

export const SEGMENT_TYPES = ["enterprise", "government", "campus", "industrial", "hotel"] as const;
export type SegmentType = (typeof SEGMENT_TYPES)[number];

export const SEGMENT_PRIORITIES = ["high", "medium", "low"] as const;
export type SegmentPriority = (typeof SEGMENT_PRIORITIES)[number];

export interface MarketSegment {
  segmentId: string;
  type: SegmentType;
  typeLabel: string;
  priority: SegmentPriority;
  potentialValueCny: number;
  activeCampaigns: number;
  mode: ReadinessStubMode;
}

export interface MarketSegmentRuntimePayload {
  version: typeof MARKET_SEGMENT_RUNTIME_VERSION;
  gtmVersion: typeof GO_TO_MARKET_VERSION;
  segments: MarketSegment[];
  highPriorityCount: number;
  summary: string;
}
