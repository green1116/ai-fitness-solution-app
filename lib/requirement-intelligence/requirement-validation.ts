import { EVIDENCE_INTELLIGENCE_NETWORK_VERSION } from "@/lib/evidence-intelligence-network";
import { validateEvidenceIntelligenceNetworkFoundationFreeze } from "@/lib/evidence-intelligence-network";
import { validateRequirementContext } from "./requirement-context";
import { buildRequirementEngineCompatibility } from "./requirement-engine-compat";
import { validateRequirementRegistry } from "./requirement-registry";
import { validateRequirementQueryRegistry } from "./requirement-query";
import { validateRequirementGraphRegistry } from "./requirement-graph/requirement-graph-traversal";
import {
  validateRequirementCompliance,
  validateRequirementComplianceGap,
  validateRequirementComplianceMatrix,
  validateTenderCompliance,
} from "./requirement-compliance/compliance-context";
import type {
  RequirementIntelligenceNetworkValidation,
  RequirementIntelligencePhase2Validation,
  RequirementIntelligencePhase3Validation,
  RequirementValidation,
} from "./shared/types";
import {
  REQUIREMENT_INTELLIGENCE_P1_TAG,
  REQUIREMENT_INTELLIGENCE_P2_TAG,
  REQUIREMENT_INTELLIGENCE_P3_TAG,
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

export function validateRequirementIntelligenceNetworkPhase2(): RequirementIntelligencePhase2Validation {
  const phase1 = validateRequirementIntelligenceNetworkPhase1();
  const requirementGraph = validateRequirementGraphRegistry();

  return {
    valid: phase1.valid && requirementGraph.valid,
    phase1,
    requirementGraph,
  };
}

export function getRequirementIntelligenceNetworkPhase2FreezeMeta() {
  return {
    version: REQUIREMENT_INTELLIGENCE_VERSION,
    tag: REQUIREMENT_INTELLIGENCE_P2_TAG,
  };
}

export function validateRequirementIntelligenceNetworkPhase3(): RequirementIntelligencePhase3Validation {
  const phase2 = validateRequirementIntelligenceNetworkPhase2();
  const requirementCompliance = validateRequirementCompliance();
  const requirementComplianceMatrix = validateRequirementComplianceMatrix();
  const requirementComplianceGap = validateRequirementComplianceGap();
  const tenderCompliance = validateTenderCompliance();

  return {
    valid:
      phase2.valid &&
      requirementCompliance.valid &&
      requirementComplianceMatrix.valid &&
      requirementComplianceGap.valid &&
      tenderCompliance.valid,
    phase2,
    requirementCompliance,
    requirementComplianceMatrix,
    requirementComplianceGap,
    tenderCompliance,
  };
}

export function getRequirementIntelligenceNetworkPhase3FreezeMeta() {
  return {
    version: REQUIREMENT_INTELLIGENCE_VERSION,
    tag: REQUIREMENT_INTELLIGENCE_P3_TAG,
  };
}
