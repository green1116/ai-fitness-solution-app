import type { TenderKnowledgeGraphMode } from "../shared/types";

export type CompetitionNodeType =
  | "competitor-brand"
  | "competitor-supplier"
  | "alternative-solution";

export type CompetitionEdgeType =
  | "tender-competitor-brand"
  | "competitor-brand-supplier"
  | "competitor-brand-alternative";

export interface CompetitionNodeBase {
  nodeId: string;
  nodeType: CompetitionNodeType;
  label: string;
  sourceRecordId: string;
  sourceLayer: string;
  mode: TenderKnowledgeGraphMode;
}

export interface CompetitorBrandNode extends CompetitionNodeBase {
  nodeType: "competitor-brand";
  tenderId: string;
  brandId: string;
  brandName: string;
  strengthScore: number;
  winPressure: number;
  brandAdvantage: number;
  requirementCoverage: number;
  complianceScore: number;
  evidenceReadiness: number;
  isPrimary: boolean;
}

export interface CompetitorSupplierNode extends CompetitionNodeBase {
  nodeType: "competitor-supplier";
  supplierId: string;
  brandId: string;
  region: string;
  authorizationLevel: string;
  supplierAdvantage: number;
  linkStatus: string;
}

export interface AlternativeSolutionNode extends CompetitionNodeBase {
  nodeType: "alternative-solution";
  alternativeId: string;
  tenderId: string;
  sourceBrandId: string;
  targetBrandId: string;
  solutionKind: string;
  alternativeRisk: number;
  strengthScore: number;
}

export type CompetitionGraphNode =
  | CompetitorBrandNode
  | CompetitorSupplierNode
  | AlternativeSolutionNode;

export interface CompetitionEdge {
  edgeId: string;
  type: CompetitionEdgeType;
  sourceId: string;
  targetId: string;
  sourceNodeId: string;
  targetNodeId: string;
  weight: number;
  traceRef: string;
  tenderId: string;
  mode: TenderKnowledgeGraphMode;
}

export interface CompetitionGraph {
  graphId: string;
  nodes: CompetitionGraphNode[];
  edges: CompetitionEdge[];
  nodeCount: number;
  edgeCount: number;
  graphReady: boolean;
  mode: TenderKnowledgeGraphMode;
}

export interface CompetitionGraphContext {
  contextId: string;
  graph: CompetitionGraph;
  tenderCount: number;
  competitorBrandCount: number;
  competitorSupplierCount: number;
  alternativeSolutionCount: number;
  avgCompetitionPathsPerTender: number;
  dominantCompetitorCoverage: number;
  contextReady: boolean;
  mode: TenderKnowledgeGraphMode;
}

export interface CompetitionMetrics {
  competitionDensity: number;
  brandWinPressure: number;
  supplierPressure: number;
  alternativeSolutionStrength: number;
  requirementCoverageGap: number;
  evidenceStrengthGap: number;
  complianceGap: number;
  winProbabilityDelta: number;
  riskPressureScore: number;
}

export interface CompetitionRankingEntry {
  rank: number;
  entityId: string;
  label: string;
  score: number;
  gapToLeader: number;
}

export interface CompetitionRankingResult {
  resultId: string;
  tenderId: string;
  competitorBrandRankings: CompetitionRankingEntry[];
  competitorSupplierRankings: CompetitionRankingEntry[];
  alternativeSolutionRankings: CompetitionRankingEntry[];
}

export interface CompetitionAnalysisResult {
  analysisId: string;
  tenderId: string;
  competitionGraph: CompetitionGraph;
  metrics: CompetitionMetrics;
  competitorBrandRankings: CompetitionRankingEntry[];
  competitorSupplierRankings: CompetitionRankingEntry[];
  alternativeSolutionRankings: CompetitionRankingEntry[];
  winProbabilityDelta: number;
  riskSummary: string;
  gapSummary: string;
  dominantCompetitor: CompetitorBrandNode | undefined;
  bestCounterStrategyHints: string[];
  mode: TenderKnowledgeGraphMode;
}

export interface CompetitionTraversalResult {
  tenderId: string;
  startNodeId: string;
  visitedNodeIds: string[];
  visitedEdgeIds: string[];
  competitorBrandNodeIds: string[];
  pathCount: number;
}

export interface CompetitionGraphValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface TenderKnowledgeGraphPhase2Validation {
  valid: boolean;
  competitionGraph: CompetitionGraphValidation;
  competitionAnalysis: CompetitionGraphValidation;
  competitionRanking: CompetitionGraphValidation;
  winPressure: CompetitionGraphValidation;
  compatibility: CompetitionGraphValidation;
}
