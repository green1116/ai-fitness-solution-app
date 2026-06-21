/**
 * V64 P3 — Upgrade event tracker
 */

import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import type { SaasPlan } from "@/lib/saas/types";

export type UpgradeEventType = "impression" | "click" | "conversion" | "dismiss";

export type UpgradeEventRecord = {
  triggerId: string;
  fromPlan: SaasPlan | "FREE";
  toPlan: SaasPlan;
  eventType: UpgradeEventType;
  timestamp: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __revenueUpgradeEvents: UpgradeEventRecord[] | undefined;
}

function getStore(): UpgradeEventRecord[] {
  globalThis.__revenueUpgradeEvents ||= [];
  return globalThis.__revenueUpgradeEvents;
}

export function recordUpgradeEvent(input: Omit<UpgradeEventRecord, "timestamp">) {
  getStore().push({ ...input, timestamp: Date.now() });
  if (getStore().length > 5000) getStore().splice(0, getStore().length - 5000);

  appendGrowthEvent({
    event: `revenue.upgrade_${input.eventType}`,
    meta: {
      triggerId: input.triggerId,
      fromPlan: input.fromPlan,
      toPlan: input.toPlan,
      layer: "v64-p3",
    },
  });
}

export function getUpgradeEventsSnapshot(): UpgradeEventRecord[] {
  return [...getStore()];
}

export function clearUpgradeStoreForTests(): void {
  globalThis.__revenueUpgradeEvents = [];
}

export function aggregateUpgradeStats(): {
  impressions: number;
  clicks: number;
  conversions: number;
  upgradeRate: number;
} {
  const events = getUpgradeEventsSnapshot();
  const impressions = events.filter((e) => e.eventType === "impression").length;
  const clicks = events.filter((e) => e.eventType === "click").length;
  const conversions = events.filter((e) => e.eventType === "conversion").length;
  const upgradeRate = impressions > 0 ? Math.round((conversions / impressions) * 100) : 0;
  return { impressions, clicks, conversions, upgradeRate };
}
