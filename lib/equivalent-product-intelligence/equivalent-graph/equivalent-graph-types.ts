import type { EquivalentProductIntelligenceMode } from "../shared/constants";
import type { ProductRecord, SpecificationRecord } from "../product-foundation/product-spec-types";

export type EquivalentMappingKind =
  | "direct-equivalent"
  | "functional-substitute"
  | "upgrade-substitute"
  | "downgrade-substitute"
  | "cross-brand-equivalent"
  | "emergency-substitute";

export interface EquivalentProductEdge {
  edgeId: string;
  sourceProductId: string;
  targetProductId: string;
  kind: EquivalentMappingKind;
  score: number;
  confidence: number;
  reason: string[];
  mode: EquivalentProductIntelligenceMode;
}

export interface RequirementProductEdge {
  edgeId: string;
  requirementId: string;
  productId: string;
  fitScore: number;
  specFitScore: number;
  confidence: number;
  mode: EquivalentProductIntelligenceMode;
}

export interface ProductNode {
  nodeId: string;
  nodeType: "product";
  productId: string;
  skuId: string;
  brandId?: string;
  category: string;
  label: string;
  mode: EquivalentProductIntelligenceMode;
}

export interface SpecificationNode {
  nodeId: string;
  nodeType: "specification";
  specificationId: string;
  category: string;
  label: string;
  mode: EquivalentProductIntelligenceMode;
}

export type EquivalentGraphNode = ProductNode | SpecificationNode;

export interface EquivalentScore {
  specOverlapScore: number;
  brandDistanceScore: number;
  functionalSimilarityScore: number;
  catalogSimilarityScore: number;
  totalScore: number;
}

export interface EquivalentGraph {
  graphId: string;
  nodes: EquivalentGraphNode[];
  equivalentEdges: EquivalentProductEdge[];
  requirementProductEdges: RequirementProductEdge[];
  productCount: number;
  equivalentEdgeCount: number;
  graphReady: boolean;
  mode: EquivalentProductIntelligenceMode;
}

export interface EquivalentGraphContext {
  contextId: string;
  products: ProductRecord[];
  specifications: SpecificationRecord[];
  equivalentEdges: EquivalentProductEdge[];
  requirementProductEdges: RequirementProductEdge[];
  contextReady: boolean;
  mode: EquivalentProductIntelligenceMode;
}

export interface EquivalentTraversalHop {
  hop: number;
  productId: string;
  edgeKind: EquivalentMappingKind;
  score: number;
  path: string[];
}

export interface EquivalentTraversalResult {
  traversalId: string;
  sourceProductId: string;
  hops: EquivalentTraversalHop[];
  crossBrandCount: number;
  mode: EquivalentProductIntelligenceMode;
}

export interface EquivalentMappingValidation {
  valid: boolean;
  edgeCount: number;
  averageMappingPerProduct: number;
  crossBrandCoverage: number;
  graphConnectivity: boolean;
  productNodeCount: number;
  summary: string;
}

export interface EquivalentProductIntelligencePhase2Validation {
  valid: boolean;
  phase1Valid: boolean;
  equivalentMapping: EquivalentMappingValidation;
}

export interface EquivalentProductIntelligencePhase2FreezeMeta {
  tag: string;
  version: string;
  phase: number;
  valid: boolean;
}
