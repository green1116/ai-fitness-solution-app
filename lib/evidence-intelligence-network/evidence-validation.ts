import { BRAND_INTELLIGENCE_NETWORK_VERSION } from "@/lib/brand-intelligence-network";
import { validateBrandIntelligenceNetworkFoundation } from "@/lib/brand-intelligence-network";
import { REAL_CATALOG_FOUNDATION_VERSION } from "@/lib/real-catalog-foundation";
import { validateEvidenceContext } from "./evidence-context";
import {
  buildEvidenceEngineCompatibility,
  EVIDENCE_RUNTIME_LAYER_LABEL,
} from "./evidence-engine-compat";
import { validateEvidenceRegistry } from "./evidence-registry";
import type {
  EvidenceIntelligenceNetworkFoundationValidation,
  EvidenceIntelligenceNetworkPhase2Validation,
  EvidenceIntelligenceNetworkPhase3Validation,
  EvidenceIntelligenceNetworkPhase4Validation,
  EvidenceIntelligenceNetworkValidation,
  RegistryValidation,
} from "./shared/types";
import {
  EVIDENCE_INTELLIGENCE_NETWORK_FOUNDATION_TAG,
  EVIDENCE_INTELLIGENCE_NETWORK_P1_TAG,
  EVIDENCE_INTELLIGENCE_NETWORK_P2_TAG,
  EVIDENCE_INTELLIGENCE_NETWORK_P3_TAG,
  EVIDENCE_INTELLIGENCE_NETWORK_P4_TAG,
  EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
} from "./shared/types";
import { validateEvidenceGraphRegistry } from "./evidence-graph/evidence-graph-traversal";
import { validateEvidenceCoverageContext } from "./evidence-coverage/coverage-context";
import {
  validateEvidenceCoverageRegistry,
  validateRequirementStubRegistry,
} from "./evidence-coverage/coverage-registry";
import { validateEvidenceReadinessRegistry } from "./evidence-readiness/readiness-context";
import { validateEvidenceQueryRegistry } from "./evidence-query";
import { validateEvidenceMatcherRegistry } from "./evidence-matcher";

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

export function validateEvidenceIntelligenceNetworkPhase2(): EvidenceIntelligenceNetworkPhase2Validation {
  const phase1 = validateEvidenceIntelligenceNetworkPhase1();
  const evidenceGraph = validateEvidenceGraphRegistry();

  return {
    valid: phase1.valid && evidenceGraph.valid,
    phase1,
    evidenceGraph,
  };
}

export function getEvidenceIntelligenceNetworkPhase2FreezeMeta() {
  return {
    version: EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
    tag: EVIDENCE_INTELLIGENCE_NETWORK_P2_TAG,
  };
}

export function validateEvidenceIntelligenceNetworkPhase3(): EvidenceIntelligenceNetworkPhase3Validation {
  const phase2 = validateEvidenceIntelligenceNetworkPhase2();
  const evidenceCoverage = validateEvidenceCoverageRegistry();
  const requirementStub = validateRequirementStubRegistry();
  const coverageContext = validateEvidenceCoverageContext();

  return {
    valid:
      phase2.valid &&
      evidenceCoverage.valid &&
      requirementStub.valid &&
      coverageContext.valid,
    phase2,
    evidenceCoverage,
    requirementStub,
  };
}

export function getEvidenceIntelligenceNetworkPhase3FreezeMeta() {
  return {
    version: EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
    tag: EVIDENCE_INTELLIGENCE_NETWORK_P3_TAG,
  };
}

export function validateEvidenceIntelligenceNetworkPhase4(): EvidenceIntelligenceNetworkPhase4Validation {
  const phase3 = validateEvidenceIntelligenceNetworkPhase3();
  const evidenceReadiness = validateEvidenceReadinessRegistry();
  const evidenceQuery = validateEvidenceQueryRegistry();
  const evidenceMatcher = validateEvidenceMatcherRegistry();

  return {
    valid:
      phase3.valid &&
      evidenceReadiness.valid &&
      evidenceQuery.valid &&
      evidenceMatcher.valid,
    phase3,
    evidenceReadiness,
    evidenceQuery,
    evidenceMatcher,
  };
}

export function validateEvidenceIntelligenceNetworkFoundationFreeze(): EvidenceIntelligenceNetworkFoundationValidation {
  const phase4 = validateEvidenceIntelligenceNetworkPhase4();
  const registry = validateEvidenceRegistry();
  const graph = validateEvidenceGraphRegistry();
  const coverage = validateEvidenceCoverageRegistry();
  const requirementStub = validateRequirementStubRegistry();
  const compatibility = validateEngineCompatibility();

  return {
    valid:
      phase4.valid &&
      registry.valid &&
      graph.valid &&
      coverage.valid &&
      requirementStub.valid &&
      compatibility.valid,
    phase4,
    registry,
    graph,
    coverage,
    requirementStub,
    compatibility,
  };
}

export function getEvidenceIntelligenceNetworkPhase4FreezeMeta() {
  return {
    version: EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
    tag: EVIDENCE_INTELLIGENCE_NETWORK_P4_TAG,
  };
}

export function getEvidenceIntelligenceNetworkFoundationFreezeMeta() {
  return {
    version: EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
    tag: EVIDENCE_INTELLIGENCE_NETWORK_FOUNDATION_TAG,
  };
}
