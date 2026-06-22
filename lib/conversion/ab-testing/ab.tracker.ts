/**
 * V64 P2 — A/B test event tracker
 */

import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import type { ConversionExperimentType } from "../conversion.types";

export type AbEventType = "impression" | "click" | "conversion";

export type AbEventRecord = {
  experimentId: string;
  variantId: string;
  experimentType: ConversionExperimentType;
  eventType: AbEventType;
  timestamp: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __conversionAbEvents: AbEventRecord[] | undefined;
}

function getAbStore(): AbEventRecord[] {
  globalThis.__conversionAbEvents ||= [];
  return globalThis.__conversionAbEvents;
}

export function recordAbEvent(input: {
  experimentId: string;
  variantId: string;
  experimentType: ConversionExperimentType;
  eventType: AbEventType;
}) {
  getAbStore().push({
    ...input,
    timestamp: Date.now(),
  });
  if (getAbStore().length > 10000) {
    getAbStore().splice(0, getAbStore().length - 10000);
  }

  appendGrowthEvent({
    event: `cro.ab_${input.eventType}`,
    meta: {
      experimentId: input.experimentId,
      variantId: input.variantId,
      experimentType: input.experimentType,
      layer: "v64-p2",
    },
  });
}

export function getAbEventsSnapshot(): AbEventRecord[] {
  return [...getAbStore()];
}

export function clearAbStoreForTests(): void {
  globalThis.__conversionAbEvents = [];
}

export function aggregateAbStats(experimentId: string): Map<
  string,
  { impressions: number; clicks: number; conversions: number }
> {
  const stats = new Map<string, { impressions: number; clicks: number; conversions: number }>();
  for (const e of getAbEventsSnapshot()) {
    if (e.experimentId !== experimentId) continue;
    const cur = stats.get(e.variantId) ?? { impressions: 0, clicks: 0, conversions: 0 };
    if (e.eventType === "impression") cur.impressions += 1;
    if (e.eventType === "click") cur.clicks += 1;
    if (e.eventType === "conversion") cur.conversions += 1;
    stats.set(e.variantId, cur);
  }
  return stats;
}
