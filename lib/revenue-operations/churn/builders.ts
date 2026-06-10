import { buildCustomerProfiles } from "../customer/builders";
import type { ChurnRecord } from "./types";

export function buildChurnRecords(input?: { deploymentId?: string }): ChurnRecord[] {
  const deploymentId = input?.deploymentId ?? "churn-default";
  return [
    {
      churnId: `churn-${deploymentId}-1`,
      customerId: `customer-${deploymentId}-churn-1`,
      companyName: "某物业公司",
      churnDate: new Date(Date.now() - 20 * 86_400_000).toISOString().slice(0, 10),
      reason: "预算削减",
      lostMrrCny: 6_000,
    },
  ];
}

export function computeChurnMetrics(input?: { deploymentId?: string }): {
  churnedCustomers: number;
  churnRate: number;
  retentionRate: number;
  churnTrend: "up" | "stable" | "down";
  records: ChurnRecord[];
} {
  const deploymentId = input?.deploymentId ?? "churn-default";
  const records = buildChurnRecords({ deploymentId });
  const customers = buildCustomerProfiles({ deploymentId });
  const total = customers.length + records.length;
  const churnRate = records.length / total;
  return {
    churnedCustomers: records.length,
    churnRate: Math.round(churnRate * 100) / 100,
    retentionRate: Math.round((1 - churnRate) * 100) / 100,
    churnTrend: "stable",
    records,
  };
}
