import { buildRenewalRecords } from "@/lib/revenue-operations/renewal/builders";
import { buildCustomerHealthScores } from "../health/builders";
import type { RenewalRiskLevel, RenewalRiskRecord } from "./types";

function mapRisk(renewalRisk: string, healthScore: number): RenewalRiskLevel {
  if (renewalRisk === "high" || healthScore < 50) return "high";
  if (renewalRisk === "medium" || healthScore < 75) return "medium";
  return "low";
}

export function buildRenewalRiskRecords(input?: { deploymentId?: string }): RenewalRiskRecord[] {
  const deploymentId = input?.deploymentId ?? "renewal-risk-default";
  const renewals = buildRenewalRecords({ deploymentId });
  const health = buildCustomerHealthScores({ deploymentId });
  const healthByCustomer = new Map(health.map((h) => [h.customerId, h]));

  return renewals.map((r) => {
    const h = healthByCustomer.get(r.customerId);
    const healthScore = h?.overallScore ?? 60;
    const riskLevel = mapRisk(r.renewalRisk, healthScore);
    const riskScore = riskLevel === "high" ? 85 : riskLevel === "medium" ? 55 : 25;

    return {
      recordId: `renewal-risk-${r.renewalId}`,
      customerId: r.customerId,
      companyName: r.companyName,
      riskLevel,
      riskScore,
      drivers:
        riskLevel === "high"
          ? ["低使用率", "续费窗口临近", "客户生命周期 at-risk"]
          : riskLevel === "medium"
            ? ["功能采纳率中等", "需主动跟进"]
            : ["健康度良好", "续费意愿强"],
      renewalDate: r.renewalDate,
    };
  });
}
