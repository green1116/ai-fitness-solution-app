import { runBillingRuntime } from "./billing";
import { runRevenueDashboardRuntime } from "./dashboard";
import { runInvoiceRuntime } from "./invoice";
import { runOrderRuntime } from "./order";
import type { RevenueFoundationEvidence } from "./shared/types";
import { REVENUE_FOUNDATION_VERSION } from "./shared/types";
import { runSubscriptionRuntime } from "./subscription";
import { runTrialRuntime } from "./trial";

export const REVENUE_FOUNDATION_DOMAINS = [
  "trial",
  "order",
  "subscription",
  "invoice",
  "billing",
  "revenue-dashboard",
] as const;

export function buildRevenueFoundationEvidence(input?: {
  deploymentId?: string;
}): RevenueFoundationEvidence {
  const deploymentId = input?.deploymentId ?? "revenue-foundation-default";

  const runtimes = [
    runTrialRuntime({ deploymentId }),
    runOrderRuntime({ deploymentId }),
    runSubscriptionRuntime({ deploymentId }),
    runInvoiceRuntime({ deploymentId }),
    runBillingRuntime({ deploymentId }),
    runRevenueDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Revenue foundation evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-revenue-foundation-${deploymentId}`,
    version: REVENUE_FOUNDATION_VERSION,
    domains: [...REVENUE_FOUNDATION_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `revenue-foundation-evidence domains=${REVENUE_FOUNDATION_DOMAINS.length} allSuccess=true`,
  };
}
