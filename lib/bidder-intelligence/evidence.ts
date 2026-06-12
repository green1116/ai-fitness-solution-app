import { runBidderProfileRuntime } from "./bidder-profile";
import { runBrandLibraryRuntime } from "./brand-library";
import { runBidderDashboardRuntime } from "./dashboard";
import { runEquipmentCatalogRuntime } from "./equipment-catalog";
import { runProposalPersonalizationRuntime } from "./proposal-personalization";
import type { BidderIntelligenceEvidence } from "./shared/types";
import { BIDDER_INTELLIGENCE_VERSION } from "./shared/types";
import { runSupplierCapabilityRuntime } from "./supplier-capability";

export const BIDDER_INTELLIGENCE_DOMAINS = [
  "bidder-profile",
  "brand-library",
  "equipment-catalog",
  "supplier-capability",
  "proposal-personalization",
  "bidder-dashboard",
] as const;

export function buildBidderIntelligenceEvidence(input?: {
  deploymentId?: string;
}): BidderIntelligenceEvidence {
  const deploymentId = input?.deploymentId ?? "bidder-intelligence-default";

  const runtimes = [
    runBidderProfileRuntime({ deploymentId }),
    runBrandLibraryRuntime({ deploymentId }),
    runEquipmentCatalogRuntime({ deploymentId }),
    runSupplierCapabilityRuntime({ deploymentId }),
    runProposalPersonalizationRuntime({ deploymentId }),
    runBidderDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Bidder intelligence evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-bidder-intelligence-${deploymentId}`,
    version: BIDDER_INTELLIGENCE_VERSION,
    domains: [...BIDDER_INTELLIGENCE_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `bidder-intelligence-evidence domains=${BIDDER_INTELLIGENCE_DOMAINS.length} allSuccess=true`,
  };
}
