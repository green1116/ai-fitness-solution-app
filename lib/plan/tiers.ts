// lib/plan/tiers.ts
import { PlanTier } from "./types";

export const TIER_LABEL: Record<PlanTier, string> = {
  lite: "精简版（Lite）",
  standard: "标准版（Standard｜推荐）",
  pro: "强化版（Pro）",
};

export const TIER_USAGE: Record<
  PlanTier,
  { concurrentUsers: string; participationRate: string; peakHours: string }
> = {
  lite: {
    concurrentUsers: "10–15 人",
    participationRate: "10%–15%",
    peakHours: "18:00–20:00",
  },
  standard: {
    concurrentUsers: "20–30 人",
    participationRate: "15%–25%",
    peakHours: "18:00–20:00",
  },
  pro: {
    concurrentUsers: "30–40 人",
    participationRate: "25%–35%",
    peakHours: "18:00–20:00",
  },
};
