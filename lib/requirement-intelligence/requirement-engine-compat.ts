import { BRAND_INTELLIGENCE_NETWORK_VERSION } from "@/lib/brand-intelligence-network";
import { EVIDENCE_INTELLIGENCE_NETWORK_VERSION } from "@/lib/evidence-intelligence-network";
import { INDUSTRY_WORKFLOW_VERSION } from "@/lib/industry-workflow";
import { TENDER_HUB_VERSION } from "@/lib/tender-hub";
import { TENDER_MARKETPLACE_VERSION } from "@/lib/tender-marketplace";
import type { RequirementEngineCompatibility } from "./shared/types";

export function buildRequirementEngineCompatibility(): RequirementEngineCompatibility {
  return {
    evidenceIntelligenceLayer: EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
    brandIntelligenceLayer: BRAND_INTELLIGENCE_NETWORK_VERSION,
    tenderMarketplaceLayer: TENDER_MARKETPLACE_VERSION,
    tenderHubLayer: TENDER_HUB_VERSION,
    industryWorkflowLayer: INDUSTRY_WORKFLOW_VERSION,
  };
}

export function buildRequirementCompatibilityMetadata(
  requirementId: string,
  sourceRecordId: string,
): Record<string, string> {
  const compatibility = buildRequirementEngineCompatibility();
  return {
    evidenceIntelligenceLayer: compatibility.evidenceIntelligenceLayer,
    brandIntelligenceLayer: compatibility.brandIntelligenceLayer,
    tenderMarketplaceLayer: compatibility.tenderMarketplaceLayer,
    tenderHubLayer: compatibility.tenderHubLayer,
    industryWorkflowLayer: compatibility.industryWorkflowLayer,
    requirementId,
    sourceRecordId,
    sourceLayer: "v40-requirement-intelligence",
  };
}
