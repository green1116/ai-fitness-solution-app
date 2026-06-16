import { EVIDENCE_INTELLIGENCE_NETWORK_VERSION } from "@/lib/evidence-intelligence-network";
import { buildRequirementComplianceRecords } from "../requirement-compliance/compliance-registry";
import {
  validateRequirementCompliance,
  validateRequirementComplianceGap,
  validateRequirementComplianceMatrix,
  validateTenderCompliance,
} from "../requirement-compliance/compliance-context";
import { validateRequirementContext } from "../requirement-context";
import { buildRequirementEngineCompatibility } from "../requirement-engine-compat";
import { buildRequirementGraph } from "../requirement-graph/requirement-graph-context";
import { validateRequirementGraphRegistry } from "../requirement-graph/requirement-graph-traversal";
import {
  buildRequirementMatcherContext,
  validateRequirementMatcherFromContext,
} from "../requirement-matcher";
import {
  buildRequirementQuerySnapshot,
  validateRequirementQueryFromSnapshot,
  validateRequirementQueryRegistryFromSnapshot,
} from "../requirement-query";
import {
  buildRequirementReadinessContext,
  resolveCanonicalReadinessResult,
  validateRequirementReadinessFromContext,
} from "../requirement-readiness/readiness-context";
import {
  buildRequirementRegistryRecords,
  validateRequirementRegistry,
} from "../requirement-registry";
import type {
  RequirementFoundationCanonical,
  RequirementFoundationContext,
  RequirementFoundationContextOptions,
  RequirementFoundationValidations,
  RequirementIntelligenceFoundationValidation,
  RequirementIntelligenceNetworkValidation,
  RequirementIntelligencePhase2Validation,
  RequirementIntelligencePhase3Validation,
  RequirementIntelligencePhase4Validation,
  RequirementMatcherContext,
  RequirementQuerySnapshot,
  RequirementReadinessContext,
  RequirementValidation,
} from "../shared/types";

let cachedFoundationContext: RequirementFoundationContext | undefined;
let cachedFoundationKey: string | undefined;

interface CachedFoundationBase {
  query: RequirementQuerySnapshot;
  readiness: RequirementReadinessContext;
  matcher: RequirementMatcherContext;
  canonical: RequirementFoundationCanonical;
  leafValidations: RequirementFoundationValidations;
}

let cachedFoundationBase: CachedFoundationBase | undefined;

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

function validateEvidenceNetworkVersionLeaf(): RequirementValidation {
  const compatibility = buildRequirementEngineCompatibility();
  const valid = compatibility.evidenceIntelligenceLayer === EVIDENCE_INTELLIGENCE_NETWORK_VERSION;

  return {
    valid,
    count: 1,
    summary: `evidence-network-version layer=${compatibility.evidenceIntelligenceLayer} valid=${valid}`,
  };
}

function warmFoundationLayerCaches(): void {
  console.log("[foundation] warm registry");
  buildRequirementRegistryRecords();
  console.log("[foundation] warm compliance");
  buildRequirementComplianceRecords();
  console.log("[foundation] warm graph");
  buildRequirementGraph();
}

function buildFoundationBaseLayers(): CachedFoundationBase {
  if (cachedFoundationBase) {
    console.log("[foundation] cache hit: base layers");
    return cachedFoundationBase;
  }

  console.log("[foundation] cache miss: assembling base layers");
  warmFoundationLayerCaches();

  console.log("[foundation] assemble readiness");
  const readiness = buildRequirementReadinessContext();
  const canonicalReadiness = resolveCanonicalReadinessResult(readiness.results);

  console.log("[foundation] assemble query snapshot");
  const query = buildRequirementQuerySnapshot();

  console.log("[foundation] assemble matcher");
  const matcher = buildRequirementMatcherContext(query);

  console.log("[foundation] leaf validations once");
  const leafValidations: RequirementFoundationValidations = {
    registry: validateRequirementRegistry(),
    requirementContext: validateRequirementContext(),
    graph: validateRequirementGraphRegistry(),
    compliance: validateRequirementCompliance(),
    complianceMatrix: validateRequirementComplianceMatrix(),
    complianceGap: validateRequirementComplianceGap(),
    tenderCompliance: validateTenderCompliance(),
    engineCompatibility: validateEngineCompatibility(),
    queryRegistry: validateRequirementQueryRegistryFromSnapshot(query),
    readiness: validateRequirementReadinessFromContext(readiness, canonicalReadiness),
    query: validateRequirementQueryFromSnapshot(query),
    matcher: validateRequirementMatcherFromContext(matcher),
  };

  cachedFoundationBase = {
    query,
    readiness,
    matcher,
    canonical: {
      requirement: query.canonical[0],
      readiness: canonicalReadiness,
    },
    leafValidations,
  };

  console.log("[foundation] base layers ready");
  return cachedFoundationBase;
}

function buildFoundationCacheKey(options: RequirementFoundationContextOptions): string {
  return `${options.includePhaseRegression ? "regression" : "no-regression"}:${options.includeEvidenceNetwork ? "evidence" : "no-evidence"}`;
}

function composePhase1Validation(
  validations: RequirementFoundationValidations,
): RequirementIntelligenceNetworkValidation {
  return {
    valid:
      validations.registry.valid &&
      validations.requirementContext.valid &&
      validations.engineCompatibility.valid &&
      validations.queryRegistry.valid &&
      (validations.evidenceNetwork?.valid ?? true),
    requirementRegistry: validations.registry,
    requirementContext: validations.requirementContext,
    engineCompatibility: validations.engineCompatibility,
  };
}

function composePhase2Validation(
  validations: RequirementFoundationValidations,
  phase1Valid: boolean,
): RequirementIntelligencePhase2Validation {
  return {
    valid: phase1Valid && validations.graph.valid,
    phase1: composePhase1Validation(validations),
    requirementGraph: validations.graph,
  };
}

function composePhase3Validation(
  foundation: RequirementFoundationContext,
): RequirementIntelligencePhase3Validation {
  const { validations, regression } = foundation;

  return {
    valid: regression.phase3Valid,
    phase2: composePhase2Validation(validations, regression.phase2Valid),
    requirementCompliance: validations.compliance,
    requirementComplianceMatrix: validations.complianceMatrix,
    requirementComplianceGap: validations.complianceGap,
    tenderCompliance: validations.tenderCompliance,
  };
}

function createRequirementFoundationContext(
  options: RequirementFoundationContextOptions = {},
): RequirementFoundationContext {
  const includePhaseRegression = options.includePhaseRegression ?? false;
  const includeEvidenceNetwork = options.includeEvidenceNetwork ?? false;

  console.log(
    `[foundation] create start regression=${includePhaseRegression} evidence=${includeEvidenceNetwork}`,
  );

  const base = buildFoundationBaseLayers();

  const evidenceNetwork = includeEvidenceNetwork ? validateEvidenceNetworkVersionLeaf() : undefined;
  const validations: RequirementFoundationValidations = {
    ...base.leafValidations,
    evidenceNetwork,
  };

  const phase1Valid =
    validations.registry.valid &&
    validations.requirementContext.valid &&
    validations.engineCompatibility.valid &&
    validations.queryRegistry.valid &&
    (evidenceNetwork?.valid ?? true);

  const phase2Valid = phase1Valid && validations.graph.valid;
  const phase3Valid =
    phase2Valid &&
    validations.compliance.valid &&
    validations.complianceMatrix.valid &&
    validations.complianceGap.valid &&
    validations.tenderCompliance.valid;

  const regression = includePhaseRegression
    ? { phase1Valid, phase2Valid, phase3Valid }
    : { phase1Valid: true, phase2Valid: true, phase3Valid: true };

  const contextReady =
    base.readiness.contextReady &&
    base.matcher.contextReady &&
    validations.readiness.valid &&
    validations.query.valid &&
    validations.matcher.valid;

  console.log("[foundation] create done");

  return {
    contextId: "requirement-foundation-context-v40-p4",
    query: base.query,
    readiness: base.readiness,
    matcher: base.matcher,
    validations,
    regression,
    canonical: base.canonical,
    contextReady,
    mode: "requirement-intelligence",
  };
}

export function buildRequirementFoundationContext(
  options: RequirementFoundationContextOptions = {},
): RequirementFoundationContext {
  console.log("[foundation] enter buildRequirementFoundationContext");
  const key = buildFoundationCacheKey(options);

  if (cachedFoundationContext && cachedFoundationKey === key) {
    console.log(`[foundation] cache hit: context ${key}`);
    return cachedFoundationContext;
  }

  console.log(`[foundation] cache miss: context ${key}`);
  cachedFoundationContext = createRequirementFoundationContext(options);
  cachedFoundationKey = key;
  return cachedFoundationContext;
}

export function resetRequirementFoundationContext(): void {
  cachedFoundationContext = undefined;
  cachedFoundationKey = undefined;
  cachedFoundationBase = undefined;
}

export function validateRequirementIntelligenceNetworkPhase4FromContext(
  foundation: RequirementFoundationContext,
): RequirementIntelligencePhase4Validation {
  const { validations, regression } = foundation;

  return {
    valid:
      regression.phase3Valid &&
      validations.readiness.valid &&
      validations.query.valid &&
      validations.matcher.valid,
    phase3: composePhase3Validation(foundation),
    requirementReadiness: validations.readiness,
    requirementQuery: validations.query,
    requirementMatcher: validations.matcher,
  };
}

export function validateRequirementIntelligenceNetworkFoundationFreezeFromContext(
  foundation: RequirementFoundationContext,
): RequirementIntelligenceFoundationValidation {
  const phase4 = validateRequirementIntelligenceNetworkPhase4FromContext(foundation);
  const { validations } = foundation;

  return {
    valid:
      phase4.valid &&
      validations.registry.valid &&
      validations.graph.valid &&
      validations.compliance.valid &&
      validations.engineCompatibility.valid,
    phase4,
    requirementRegistry: validations.registry,
    requirementGraph: validations.graph,
    requirementCompliance: validations.compliance,
    engineCompatibility: validations.engineCompatibility,
  };
}
