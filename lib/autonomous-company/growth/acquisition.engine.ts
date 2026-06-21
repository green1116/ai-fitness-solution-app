/**
 * V62 P3 — Growth: acquisition engine
 */

import type { CompanyState } from "../core/company.state";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";

export function increaseAcquisitionChannels(state: CompanyState): string[] {
  const channels = ["utm_campaign", "referral_loop", "content_landing"];

  appendGrowthEvent({
    event: "autonomous.acquisition_expanded",
    organizationId: state.organizationId,
    meta: { channels, traceId: state.traceId },
  });

  return channels.map((c) => `Expand acquisition channel: ${c}`);
}

export function runAcquisitionEngine(state: CompanyState): string[] {
  if (!state.metrics.growthStagnant) {
    return ["Acquisition stable — monitoring visitor-to-signup ratio"];
  }
  return increaseAcquisitionChannels(state);
}
