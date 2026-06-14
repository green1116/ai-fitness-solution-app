import { BRAND_INTELLIGENCE_NETWORK_VERSION } from "@/lib/brand-intelligence-network";
import { validateBrandIntelligenceNetworkFoundation } from "@/lib/brand-intelligence-network";
import { REAL_CATALOG_FOUNDATION_VERSION } from "@/lib/real-catalog-foundation";
import { validateEvidenceContext } from "./evidence-context";
import {
  buildEvidenceEngineCompatibility,
  EVIDENCE_RUNTIME_LAYER_LABEL,
} from "./evidence-engine-compat";
import { validateEvidenceRegistry } from "./evidence-registry";
import type { EvidenceIntelligenceNetworkValidation, RegistryValidation } from "./shared/types";
import {
  EVIDENCE_INTELLIGENCE_NETWORK_P1_TAG,
  EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
} from "./shared/types";

function validateEngineCompatibility(): RegistryValidation {
  const compatibility = buildEvidenceEngineCompatibility();
  const valid =
    compatibility.brandIntelligenceLayer === BRAND_INTELLIGENCE_NETWORK_VERSION &&
    compatibility.evidenceRuntimeLayer === EVIDENCE_RUNTIME_LAYER_LABEL &&
    compatibility.realCatalogFoundation === REAL_CATALOG_FOUNDATION_VERSION &&
    compatibility.requirementIntelligenceLayer.length > 0;

  return {
    valid,
    count: 1,
    summary: `engine-compatibility brand=${compatibility.brandIntelligenceLayer} runtime=${compatibility.evidenceRuntimeLayer} valid=${valid}`,
  };
}

export function validateEvidenceIntelligenceNetworkPhase1(): EvidenceIntelligenceNetworkValidation {
  const evidenceRegistry = validateEvidenceRegistry();
  const evidenceContext = validateEvidenceContext();
  const engineCompatibility = validateEngineCompatibility();
  const brandNetwork = validateBrandIntelligenceNetworkFoundation();

  return {
    valid:
      evidenceRegistry.valid &&
      evidenceContext.valid &&
      engineCompatibility.valid &&
      brandNetwork.valid,
    evidenceRegistry,
    evidenceContext,
    engineCompatibility,
  };
}

export function getEvidenceIntelligenceNetworkPhase1FreezeMeta() {
  return {
    version: EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
    tag: EVIDENCE_INTELLIGENCE_NETWORK_P1_TAG,
  };
}

export function validateEvidenceIntelligenceNetworkFoundation(): EvidenceIntelligenceNetworkValidation {
  return validateEvidenceIntelligenceNetworkPhase1();
}
