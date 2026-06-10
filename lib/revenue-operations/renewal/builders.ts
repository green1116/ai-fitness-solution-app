import type { RenewalRecord } from "./types";

export function buildRenewalRecords(input?: { deploymentId?: string }): RenewalRecord[] {
  const deploymentId = input?.deploymentId ?? "renewal-default";
  const now = new Date();
  const daysAhead = (d: number) => new Date(now.getTime() + d * 86_400_000).toISOString().slice(0, 10);
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString().slice(0, 10);

  return [
    { renewalId: `renewal-${deploymentId}-1`, customerId: `customer-${deploymentId}-1`, companyName: "某市体育局", renewalDate: daysAhead(30), status: "upcoming", amountCny: 336_000, renewalRisk: "low" },
    { renewalId: `renewal-${deploymentId}-2`, customerId: `customer-${deploymentId}-2`, companyName: "某大学", renewalDate: daysAhead(60), status: "upcoming", amountCny: 144_000, renewalRisk: "medium" },
    { renewalId: `renewal-${deploymentId}-3`, customerId: `customer-${deploymentId}-4`, companyName: "某制造企业", renewalDate: daysAhead(15), status: "at-risk", amountCny: 96_000, renewalRisk: "high" },
    { renewalId: `renewal-${deploymentId}-4`, customerId: `customer-${deploymentId}-5`, companyName: "某科技公司", renewalDate: daysAgo(10), status: "completed", amountCny: 120_000, renewalRisk: "low" },
  ];
}

export function summarizeRenewals(records: RenewalRecord[]): {
  upcomingRenewals: number;
  completedRenewals: number;
  renewalRate: number;
  renewalReadiness: number;
  renewalRisk: "low" | "medium" | "high";
} {
  const upcoming = records.filter((r) => r.status === "upcoming" || r.status === "at-risk").length;
  const completed = records.filter((r) => r.status === "completed").length;
  const total = upcoming + completed;
  const renewalRate = total > 0 ? completed / total : 0;
  const atRisk = records.filter((r) => r.renewalRisk === "high").length;
  const renewalRisk = atRisk > 0 ? "high" : records.some((r) => r.renewalRisk === "medium") ? "medium" : "low";

  return {
    upcomingRenewals: upcoming,
    completedRenewals: completed,
    renewalRate: Math.round(renewalRate * 100) / 100,
    renewalReadiness: Math.round((1 - atRisk / Math.max(records.length, 1)) * 100),
    renewalRisk,
  };
}
