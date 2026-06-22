/**
 * V62 P3 — Growth: retention engine
 */

import type { CompanyState } from "../core/company.state";
import { buildReactivationCampaign } from "@/lib/growth/retention/reactivation.engine";

export function runRetentionEngine(state: CompanyState): string[] {
  const tactics: string[] = [];

  if (state.metrics.churnRate > 10) {
    const campaign = buildReactivationCampaign(state.organizationId);
    tactics.push(`Retention campaign: ${campaign.message}`);
    tactics.push(`Recommended plan: ${campaign.recommendedPlan}`);
  } else {
    tactics.push("Retention healthy — continue engagement monitoring");
  }

  return tactics;
}
