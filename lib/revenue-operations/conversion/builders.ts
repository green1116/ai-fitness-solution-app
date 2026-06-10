import { buildCustomerProfiles } from "../customer/builders";
import { buildLeads } from "../lead/builders";
import { buildTrialRecords } from "../trial/builders";
import type { ConversionMetric } from "./types";

export function buildConversionMetrics(input?: { deploymentId?: string }): ConversionMetric[] {
  const deploymentId = input?.deploymentId ?? "conversion-default";
  const leads = buildLeads({ deploymentId });
  const trials = buildTrialRecords({ deploymentId });
  const customers = buildCustomerProfiles({ deploymentId });

  const leadConverted = leads.filter((l) => l.status === "converted").length;
  const trialConverted = trials.filter((t) => t.outcome === "converted").length;
  const payingCustomers = customers.filter((c) => c.tier !== "trial").length;

  return [
    {
      metricId: `conv-lead-${deploymentId}`,
      category: "lead",
      rate: leadConverted / leads.length,
      numerator: leadConverted,
      denominator: leads.length,
      trend: "up",
    },
    {
      metricId: `conv-trial-${deploymentId}`,
      category: "trial",
      rate: trialConverted / trials.length,
      numerator: trialConverted,
      denominator: trials.length,
      trend: "stable",
    },
    {
      metricId: `conv-customer-${deploymentId}`,
      category: "customer",
      rate: payingCustomers / customers.length,
      numerator: payingCustomers,
      denominator: customers.length,
      trend: "up",
    },
  ];
}
