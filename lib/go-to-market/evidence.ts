import { runCampaignRuntime } from "./campaign";
import { runGtmDashboardRuntime } from "./dashboard";
import { runGtmAnalyticsRuntime } from "./gtm-analytics";
import { runLeadAcquisitionRuntime } from "./lead-acquisition";
import { runMarketSegmentRuntime } from "./market-segment";
import { runOutreachRuntime } from "./outreach";
import { runProductLaunchRuntime } from "./product-launch";
import type { GtmEvidence } from "./shared/types";
import { GO_TO_MARKET_VERSION } from "./shared/types";

export const GTM_DOMAINS = [
  "product-launch",
  "campaign-runtime",
  "lead-acquisition",
  "outreach-runtime",
  "market-segment",
  "gtm-analytics",
  "gtm-dashboard",
] as const;

export function buildGtmEvidence(input?: { deploymentId?: string }): GtmEvidence {
  const deploymentId = input?.deploymentId ?? "gtm-default";

  const runtimes = [
    runProductLaunchRuntime({ deploymentId }),
    runCampaignRuntime({ deploymentId }),
    runLeadAcquisitionRuntime({ deploymentId }),
    runOutreachRuntime({ deploymentId }),
    runMarketSegmentRuntime({ deploymentId }),
    runGtmAnalyticsRuntime({ deploymentId }),
    runGtmDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`GTM evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-gtm-${deploymentId}`,
    version: GO_TO_MARKET_VERSION,
    domains: [...GTM_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `gtm-evidence domains=${GTM_DOMAINS.length} allSuccess=true`,
  };
}
