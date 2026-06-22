/**
 * V62 P3 — Sales: negotiation engine (strategy only — no direct billing)
 */

import type { CompanyState } from "../core/company.state";
import { getPricingTier, buildUpgradeMessage } from "@/lib/growth/conversion/pricing.strategy";

export function runNegotiationEngine(state: CompanyState): string[] {
  const tactics: string[] = [];

  if (state.metrics.conversionDropping) {
    tactics.push("Offer value-add bundle instead of price discount");
    tactics.push(buildUpgradeMessage("BASIC", "PRO"));
  }

  if (state.business.dealCount < 3) {
    tactics.push("Accelerate proposal follow-up for stalled deals");
    tactics.push(`Enterprise pitch: ${getPricingTier("ENTERPRISE").headline}`);
  }

  if (tactics.length === 0) {
    tactics.push("Negotiation posture stable — maintain deal velocity");
  }

  return tactics;
}
