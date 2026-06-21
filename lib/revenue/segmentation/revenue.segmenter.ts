/**
 * V64 P3 — Revenue segmenter
 */

import type { RevenueSegment } from "../revenue.types";
import { scoreUserValue } from "./user.segment.engine";
import { getGrowthEventsSnapshot } from "@/lib/growth/growth.events.store";

export function segmentRevenueBase(): { segment: RevenueSegment; count: number }[] {
  const events = getGrowthEventsSnapshot();
  const orgIds = [
    ...new Set(events.map((e) => e.organizationId).filter(Boolean) as string[]),
  ];

  const counts: Record<RevenueSegment, number> = {
    LOW_VALUE: 0,
    MID_VALUE: 0,
    HIGH_VALUE: 0,
    ENTERPRISE_VALUE: 0,
  };

  if (orgIds.length === 0) {
    counts.LOW_VALUE = 1;
    return Object.entries(counts).map(([segment, count]) => ({
      segment: segment as RevenueSegment,
      count,
    }));
  }

  for (const orgId of orgIds) {
    const profile = scoreUserValue({ organizationId: orgId });
    counts[profile.segment] += 1;
  }

  return (Object.keys(counts) as RevenueSegment[]).map((segment) => ({
    segment,
    count: counts[segment],
  }));
}

export function analyzeRevenueStructure(): {
  segments: ReturnType<typeof segmentRevenueBase>;
  highValueShare: number;
  enterpriseShare: number;
} {
  const segments = segmentRevenueBase();
  const total = segments.reduce((s, x) => s + x.count, 0) || 1;
  const highValue = segments.find((s) => s.segment === "HIGH_VALUE")?.count ?? 0;
  const enterprise = segments.find((s) => s.segment === "ENTERPRISE_VALUE")?.count ?? 0;

  return {
    segments,
    highValueShare: Math.round((highValue / total) * 100),
    enterpriseShare: Math.round((enterprise / total) * 100),
  };
}
