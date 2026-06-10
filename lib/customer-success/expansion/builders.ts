import { buildCustomerProfiles } from "@/lib/revenue-operations/customer/builders";
import type { ExpansionOpportunity, ExpansionType } from "./types";

const TYPE_LABELS: Record<ExpansionType, string> = {
  upgrade: "Upgrade 升级机会",
  "cross-sell": "Cross-sell 交叉销售",
  enterprise: "Enterprise 企业扩展",
};

export function buildExpansionOpportunities(input?: { deploymentId?: string }): ExpansionOpportunity[] {
  const deploymentId = input?.deploymentId ?? "expansion-default";
  const profiles = buildCustomerProfiles({ deploymentId });

  const opportunities: ExpansionOpportunity[] = [];
  for (const p of profiles) {
    if (p.tier === "trial") {
      opportunities.push({
        opportunityId: `exp-upgrade-${p.customerId}`,
        customerId: p.customerId,
        companyName: p.companyName,
        type: "upgrade",
        typeLabel: TYPE_LABELS.upgrade,
        estimatedValueCny: 96_000,
        confidence: 0.72,
        mode: "readiness-stub",
      });
    }
    if (p.tier === "professional") {
      opportunities.push({
        opportunityId: `exp-cross-${p.customerId}`,
        customerId: p.customerId,
        companyName: p.companyName,
        type: "cross-sell",
        typeLabel: TYPE_LABELS["cross-sell"],
        estimatedValueCny: 48_000,
        confidence: 0.65,
        mode: "readiness-stub",
      });
    }
    if (p.tier === "professional" && p.lifecycleStage === "expanding") {
      opportunities.push({
        opportunityId: `exp-enterprise-${p.customerId}`,
        customerId: p.customerId,
        companyName: p.companyName,
        type: "enterprise",
        typeLabel: TYPE_LABELS.enterprise,
        estimatedValueCny: 180_000,
        confidence: 0.58,
        mode: "readiness-stub",
      });
    }
  }

  return opportunities;
}

