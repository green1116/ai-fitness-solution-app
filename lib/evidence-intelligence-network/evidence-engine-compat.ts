import {
  BRAND_INTELLIGENCE_NETWORK_VERSION,
} from "@/lib/brand-intelligence-network";
import { BRAND_PORTAL_VERSION } from "@/lib/brand-portal";
import { REAL_CATALOG_FOUNDATION_VERSION } from "@/lib/real-catalog-foundation";
import type { EvidenceEngineCompatibility } from "./shared/types";

export const EVIDENCE_RUNTIME_LAYER_LABEL = "v3.4-evidence-runtime-foundation" as const;
export const REQUIREMENT_INTELLIGENCE_LAYER_PLACEHOLDER =
  "v40-requirement-intelligence-pending" as const;

export function buildEvidenceEngineCompatibility(): EvidenceEngineCompatibility {
  return {
    brandIntelligenceLayer: BRAND_INTELLIGENCE_NETWORK_VERSION,
    evidenceRuntimeLayer: EVIDENCE_RUNTIME_LAYER_LABEL,
    brandPortalLayer: BRAND_PORTAL_VERSION,
    realCatalogFoundation: REAL_CATALOG_FOUNDATION_VERSION,
    requirementIntelligenceLayer: REQUIREMENT_INTELLIGENCE_LAYER_PLACEHOLDER,
  };
}

export function buildEvidenceCompatibilityMetadata(
  evidenceId: string,
  brandLinkId: string,
): Record<string, string> {
  const compatibility = buildEvidenceEngineCompatibility();
  return {
    brandIntelligenceLayer: compatibility.brandIntelligenceLayer,
    evidenceRuntimeLayer: compatibility.evidenceRuntimeLayer,
    brandPortalLayer: compatibility.brandPortalLayer,
    realCatalogFoundation: compatibility.realCatalogFoundation,
    requirementIntelligenceLayer: compatibility.requirementIntelligenceLayer,
    evidenceId,
    brandLinkId,
    sourceLayer: "v39-evidence-intelligence-network",
  };
}
