import { EVIDENCE_INTELLIGENCE_NETWORK_VERSION } from "@/lib/evidence-intelligence-network";
import { validateEvidenceIntelligenceNetworkFoundationFreeze } from "@/lib/evidence-intelligence-network";
import { validateRequirementContext } from "./requirement-context";
import { buildRequirementEngineCompatibility } from "./requirement-engine-compat";
import { validateRequirementRegistry } from "./requirement-registry";
import { validateRequirementQueryRegistry } from "./requirement-query";
import type { RequirementIntelligenceNetworkValidation, RequirementValidation } from "./shared/types";
import {
  REQUIREMENT_INTELLIGENCE_P1_TAG,
  REQUIREMENT_INTELLIGENCE_VERSION,
} from "./shared/types";

function validateEngineCompatibility(): RequirementValidation {
  const compatibility = buildRequirementEngineCompatibility();
  const valid =
    compatibility.evidenceIntelligenceLayer === EVIDENCE_INTELLIGENCE_NETWORK_VERSION &&
    compatibility.tenderMarketplaceLayer.length > 0 &&
    compatibility.tenderHubLayer.length > 0 &&
    compatibility.industryWorkflowLayer.length > 0;

  return {
    valid,
    count: 1,
    summary: `engine-compatibility evidence=${compatibility.evidenceIntelligenceLayer} tenderHub=${compatibility.tenderHubLayer} valid=${valid}`,
  };
}

export function validateRequirementIntelligenceNetworkPhase1(): RequirementIntelligenceNetworkValidation {
  const requirementRegistry = validateRequirementRegistry();
  const requirementContext = validateRequirementContext();
  const engineCompatibility = validateEngineCompatibility();
  const requirementQuery = validateRequirementQueryRegistry();
  const evidenceNetwork = validateEvidenceIntelligenceNetworkFoundationFreeze();

  return {
    valid:
      requirementRegistry.valid &&
      requirementContext.valid &&
      engineCompatibility.valid &&
      requirementQuery.valid &&
      evidenceNetwork.valid,
    requirementRegistry,
    requirementContext,
    engineCompatibility,
  };
}

export function getRequirementIntelligenceNetworkPhase1FreezeMeta() {
  return {
    version: REQUIREMENT_INTELLIGENCE_VERSION,
    tag: REQUIREMENT_INTELLIGENCE_P1_TAG,
  };
}

export function validateRequirementIntelligenceNetworkFoundation(): RequirementIntelligenceNetworkValidation {
  return validateRequirementIntelligenceNetworkPhase1();
}

export { validateRequirementQueryRegistry };
