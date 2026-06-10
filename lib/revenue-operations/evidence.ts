import { runChurnRuntime } from "./churn";
import { runConversionRuntime } from "./conversion";
import { runCustomerRuntime } from "./customer";
import { runRevenueOpsDashboardRuntime } from "./dashboard";
import { runLeadRuntime } from "./lead";
import { runOpportunityRuntime } from "./opportunity";
import { runRenewalRuntime } from "./renewal";
import { runRevenueAnalyticsRuntime } from "./revenue-analytics";
import type { RevOpsEvidence } from "./shared/types";
import { REVENUE_OPERATIONS_VERSION } from "./shared/types";
import { runTrialOperationsRuntime } from "./trial";

export const REVENUE_OPS_DOMAINS = [
  "lead-runtime",
  "opportunity-runtime",
  "customer-runtime",
  "trial-operations",
  "conversion-runtime",
  "renewal-runtime",
  "churn-runtime",
  "revenue-analytics",
  "revenue-dashboard",
] as const;

export function buildRevenueOperationsEvidence(input?: {
  deploymentId?: string;
}): RevOpsEvidence {
  const deploymentId = input?.deploymentId ?? "revenue-operations-default";

  const runtimes = [
    runLeadRuntime({ deploymentId }),
    runOpportunityRuntime({ deploymentId }),
    runCustomerRuntime({ deploymentId }),
    runTrialOperationsRuntime({ deploymentId }),
    runConversionRuntime({ deploymentId }),
    runRenewalRuntime({ deploymentId }),
    runChurnRuntime({ deploymentId }),
    runRevenueAnalyticsRuntime({ deploymentId }),
    runRevenueOpsDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Revenue operations evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-revenue-operations-${deploymentId}`,
    version: REVENUE_OPERATIONS_VERSION,
    domains: [...REVENUE_OPS_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `revenue-operations-evidence domains=${REVENUE_OPS_DOMAINS.length} allSuccess=true`,
  };
}
