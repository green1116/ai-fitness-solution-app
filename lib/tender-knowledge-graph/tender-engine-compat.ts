import { BRAND_INTELLIGENCE_NETWORK_VERSION } from "@/lib/brand-intelligence-network";
import { EVIDENCE_INTELLIGENCE_NETWORK_VERSION } from "@/lib/evidence-intelligence-network";
import { REQUIREMENT_INTELLIGENCE_VERSION } from "@/lib/requirement-intelligence";
import { TENDER_HUB_VERSION } from "@/lib/tender-hub";
import type { TenderKnowledgeEngineCompatibility } from "./shared/types";

export function buildTenderKnowledgeEngineCompatibility(): TenderKnowledgeEngineCompatibility {
  return {
    brandIntelligenceLayer: BRAND_INTELLIGENCE_NETWORK_VERSION,
    evidenceIntelligenceLayer: EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
    requirementIntelligenceLayer: REQUIREMENT_INTELLIGENCE_VERSION,
    tenderHubLayer: TENDER_HUB_VERSION,
  };
}
