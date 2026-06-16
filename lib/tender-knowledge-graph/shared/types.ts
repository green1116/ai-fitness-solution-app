export type TenderKnowledgeGraphMode = "tender-knowledge-graph";

export type TenderGraphNodeType = "tender" | "requirement" | "evidence" | "brand";

export type TenderGraphEdgeType =
  | "tender-requirement"
  | "requirement-evidence"
  | "requirement-brand"
  | "tender-brand";

export type TenderWinLevel = "high" | "medium" | "low" | "blocked";

export type TenderPriority = "critical" | "high" | "medium" | "low";

export interface TenderKnowledgeEngineCompatibility {
  brandIntelligenceLayer: string;
  evidenceIntelligenceLayer: string;
  requirementIntelligenceLayer: string;
  tenderHubLayer: string;
}

export interface TenderGraphRecord {
  tenderId: string;
  projectType: string;
  budget: number;
  region: string;
  status: string;
  priority: TenderPriority;
  title: string;
  mode: TenderKnowledgeGraphMode;
}

export interface TenderRegistry {
  registryId: string;
  records: TenderGraphRecord[];
  recordCount: number;
  registryReady: boolean;
  mode: TenderKnowledgeGraphMode;
}

export interface TenderRegistryContext {
  contextId: string;
  records: TenderGraphRecord[];
  recordCount: number;
  regionBreakdown: Record<string, number>;
  statusBreakdown: Record<string, number>;
  averageBudget: number;
  contextReady: boolean;
  mode: TenderKnowledgeGraphMode;
}

export interface TenderGraphNodeBase {
  nodeId: string;
  nodeType: TenderGraphNodeType;
  label: string;
  sourceRecordId: string;
  sourceLayer: string;
  mode: TenderKnowledgeGraphMode;
}

export interface TenderNode extends TenderGraphNodeBase {
  nodeType: "tender";
  tenderId: string;
  projectType: string;
  budget: number;
  region: string;
  status: string;
  priority: TenderPriority;
}

export interface RequirementNode extends TenderGraphNodeBase {
  nodeType: "requirement";
  requirementId: string;
  tenderId: string;
  kind: string;
  priority: string;
  complianceScore: number;
}

export interface EvidenceNode extends TenderGraphNodeBase {
  nodeType: "evidence";
  evidenceId: string;
  kind: string;
  score: number;
  freshness: number;
  coverageLevel: string;
}

export interface BrandNode extends TenderGraphNodeBase {
  nodeType: "brand";
  brandId: string;
  strengthScore: number;
  coverage: number;
  winProbability: number;
}

export type TenderGraphNode = TenderNode | RequirementNode | EvidenceNode | BrandNode;

export interface TenderGraphEdge {
  edgeId: string;
  type: TenderGraphEdgeType;
  sourceId: string;
  targetId: string;
  sourceNodeId: string;
  targetNodeId: string;
  weight: number;
  traceRef: string;
  sourceRecordId: string;
  direction: "forward" | "bidirectional";
  mode: TenderKnowledgeGraphMode;
}

export interface TenderGraph {
  graphId: string;
  nodes: TenderGraphNode[];
  edges: TenderGraphEdge[];
  nodeCount: number;
  edgeCount: number;
  graphReady: boolean;
  mode: TenderKnowledgeGraphMode;
}

export interface WinDistribution {
  high: number;
  medium: number;
  low: number;
  blocked: number;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface TenderGraphContext {
  contextId: string;
  graph: TenderGraph;
  nodeCount: number;
  edgeCount: number;
  tenderCount: number;
  requirementCount: number;
  evidenceCount: number;
  brandCount: number;
  avgDegree: number;
  winDistribution: WinDistribution;
  riskDistribution: RiskDistribution;
  tenderRequirementCoverage: number;
  requirementEvidenceCoverage: number;
  tenderBrandCoverage: number;
  contextReady: boolean;
  mode: TenderKnowledgeGraphMode;
}

export interface TenderWinProbabilityResult {
  resultId: string;
  tenderId: string;
  winProbability: number;
  winLevel: TenderWinLevel;
  requirementCoverage: number;
  evidenceReadiness: number;
  brandAlignment: number;
  complianceScore: number;
  competitionDensity: number;
  riskSummary: string;
  mode: TenderKnowledgeGraphMode;
}

export interface TenderRiskAnalysis {
  analysisId: string;
  tenderId: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskScore: number;
  gapSummary: string;
  blockers: string[];
  mode: TenderKnowledgeGraphMode;
}

export interface TenderGraphPathResult {
  sourceNodeId: string;
  targetNodeId: string;
  nodeIds: string[];
  edgeIds: string[];
  pathKind: string;
  traceRefs: string[];
}

export interface TenderGraphTraversalResult {
  tenderId: string;
  startNodeId: string;
  visitedNodeIds: string[];
  visitedEdgeIds: string[];
  requirementNodeIds: string[];
  pathCount: number;
}

export interface TenderGraphValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface TenderKnowledgeGraphPhase1Validation {
  valid: boolean;
  tenderRegistry: TenderGraphValidation;
  tenderGraph: TenderGraphValidation;
  winProbability: TenderGraphValidation;
  compatibility: TenderGraphValidation;
}
