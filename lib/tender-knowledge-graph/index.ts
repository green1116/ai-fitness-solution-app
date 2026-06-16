/**
 * V41 Tender Knowledge Graph — Phase 1.
 * Read-only extension over V38 Brand / V39 Evidence / V40 Requirement Intelligence.
 */
export * from "./shared/types";
export * from "./tender-engine-compat";
export {
  buildTenderRegistryRecords,
  buildTenderRegistry,
  findTenderGraphRecordById,
  validateTenderRegistry,
} from "./tender-registry";
export * from "./tender-context";
export * from "./tender-query";
export * from "./tender-scoring";
export * from "./tender-validation";
export * from "./tender-graph/graph-nodes";
export * from "./tender-graph/graph-edges";
export * from "./tender-graph/tender-requirement-edge";
export * from "./tender-graph/requirement-evidence-edge";
export * from "./tender-graph/requirement-brand-edge";
export * from "./tender-graph/tender-brand-edge";
export {
  buildTenderGraph,
  buildTenderGraphContext,
  buildTenderGraphEdges,
} from "./tender-graph/tender-graph-context";
export {
  traverseTenderGraph,
  findTenderPath,
} from "./tender-graph/tender-graph-traversal";
