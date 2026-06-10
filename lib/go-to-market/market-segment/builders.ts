import type { MarketSegment, SegmentPriority, SegmentType } from "./types";
import { SEGMENT_TYPES } from "./types";

const LABELS: Record<SegmentType, string> = {
  enterprise: "Enterprise 企业",
  government: "Government 政府",
  campus: "Campus 校园",
  industrial: "Industrial 工业",
  hotel: "Hotel 酒店",
};

const META: Record<SegmentType, { priority: SegmentPriority; potential: number; campaigns: number }> = {
  government: { priority: "high", potential: 5_000_000, campaigns: 2 },
  enterprise: { priority: "high", potential: 3_500_000, campaigns: 2 },
  campus: { priority: "medium", potential: 2_000_000, campaigns: 1 },
  industrial: { priority: "medium", potential: 1_800_000, campaigns: 1 },
  hotel: { priority: "low", potential: 800_000, campaigns: 0 },
};

export function buildMarketSegments(input?: { deploymentId?: string }): MarketSegment[] {
  const deploymentId = input?.deploymentId ?? "segment-default";
  return SEGMENT_TYPES.map((type) => {
    const meta = META[type];
    return {
      segmentId: `segment-${type}-${deploymentId}`,
      type,
      typeLabel: LABELS[type],
      priority: meta.priority,
      potentialValueCny: meta.potential,
      activeCampaigns: meta.campaigns,
      mode: "readiness-stub" as const,
    };
  });
}
