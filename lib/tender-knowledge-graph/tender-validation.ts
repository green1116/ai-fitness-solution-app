import { buildTenderKnowledgeEngineCompatibility } from "./tender-engine-compat";
import { buildTenderGraphContext } from "./tender-graph/tender-graph-context";
import type { TenderGraphContext } from "./shared/types";
import { validateTenderRegistry, buildTenderRegistryRecords } from "./tender-registry";
import { calculateAllWinProbabilities } from "./tender-scoring";
import type {
  TenderGraphValidation,
  TenderKnowledgeGraphPhase1Validation,
} from "./shared/types";
import { TKG_MIN_TENDER_COUNT } from "./shared/types";

let cachedPhase1Validation: TenderKnowledgeGraphPhase1Validation | undefined;

function validateTenderKnowledgeCompatibility(): TenderGraphValidation {
  const compatibility = buildTenderKnowledgeEngineCompatibility();
  const valid =
    Boolean(compatibility.brandIntelligenceLayer) &&
    Boolean(compatibility.evidenceIntelligenceLayer) &&
    Boolean(compatibility.requirementIntelligenceLayer) &&
    Boolean(compatibility.tenderHubLayer);

  return {
    valid,
    count: 4,
    summary: `tender-compatibility v38=${compatibility.brandIntelligenceLayer} v39=${compatibility.evidenceIntelligenceLayer} v40=${compatibility.requirementIntelligenceLayer} valid=${valid}`,
  };
}

function validateTenderGraphFromContext(context: TenderGraphContext): TenderGraphValidation {
  const graph = context.graph;
  const isolated = graph.nodes.filter((node) => {
    const connected = graph.edges.some(
      (edge) => edge.sourceNodeId === node.nodeId || edge.targetNodeId === node.nodeId,
    );
    return !connected;
  });

  const valid =
    context.contextReady &&
    isolated.length === 0 &&
    context.tenderRequirementCoverage >= 90 &&
    context.requirementEvidenceCoverage >= 80 &&
    context.tenderBrandCoverage >= 70;

  return {
    valid,
    count: graph.edgeCount,
    summary: `tender-graph nodes=${graph.nodeCount} edges=${graph.edgeCount} isolated=${isolated.length} tenderReqCov=${context.tenderRequirementCoverage}% reqEvCov=${context.requirementEvidenceCoverage}% tenderBrandCov=${context.tenderBrandCoverage}% valid=${valid}`,
  };
}

export function validateTenderGraph(): TenderGraphValidation {
  return validateTenderGraphFromContext(buildTenderGraphContext());
}

export function validateTenderWinProbability(): TenderGraphValidation {
  const results = calculateAllWinProbabilities();
  const tenderCount = buildTenderRegistryRecords().length;

  const valid =
    results.length >= tenderCount &&
    tenderCount >= TKG_MIN_TENDER_COUNT &&
    results.every((result) => result.winProbability >= 0 && result.winProbability <= 100) &&
    results.every((result) => Boolean(result.winLevel));

  return {
    valid,
    count: results.length,
    summary: `tender-win-probability computed=${results.length} tenders=${tenderCount} high=${results.filter((r) => r.winLevel === "high").length} medium=${results.filter((r) => r.winLevel === "medium").length} valid=${valid}`,
  };
}

export function validateTenderIntelligenceNetworkPhase1(): TenderKnowledgeGraphPhase1Validation {
  if (cachedPhase1Validation) return cachedPhase1Validation;

  const context = buildTenderGraphContext();
  const tenderRegistry = validateTenderRegistry();
  const tenderGraph = validateTenderGraphFromContext(context);
  const winProbability = validateTenderWinProbability();
  const compatibility = validateTenderKnowledgeCompatibility();

  cachedPhase1Validation = {
    valid:
      tenderRegistry.valid &&
      tenderGraph.valid &&
      winProbability.valid &&
      compatibility.valid,
    tenderRegistry,
    tenderGraph,
    winProbability,
    compatibility,
  };

  return cachedPhase1Validation;
}

export function getTenderKnowledgeGraphPhase1FreezeMeta() {
  return {
    version: "v41-tender-knowledge-graph-1" as const,
    tag: "v41-tender-knowledge-graph-p1" as const,
  };
}
