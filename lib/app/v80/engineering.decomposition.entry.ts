/**
 * V80 APP P2 — Engineering decomposition entry (read-only)
 */
export {
  ENGINEERING_API_SPECS,
  getEngineeringApiSpecByRoute,
  isEngineeringApiSpecComplete,
} from "./engineering.api.spec";
export {
  assertEngineeringDecompositionPass,
  buildEngineeringDecomposition,
} from "./engineering.decomposition.builder";
export {
  ENGINEERING_FOLDER_STRUCTURE,
  getEngineeringFoldersByKind,
  isEngineeringFolderStructureComplete,
} from "./engineering.folder.spec";
export {
  ENGINEERING_PRISMA_MODULES,
  getEngineeringPrismaModuleByDomain,
  isEngineeringPrismaBreakdownComplete,
} from "./engineering.prisma.spec";
export {
  TENDER_PACK_WORKFLOW_DAG,
  getWorkflowDagNodeByStep,
  isEngineeringWorkflowDagComplete,
} from "./engineering.workflow.dag";
export {
  V80_APP_ENGINEERING_FREEZE_VERSION,
  V80_APP_ENGINEERING_VERSION,
} from "./engineering.types";
export type {
  ApiHandlerSpec,
  EngineeringDecompositionReport,
  EngineeringFolderEntry,
  PrismaModuleEntry,
  WorkflowDagSpec,
} from "./engineering.types";

import { buildEngineeringDecomposition } from "./engineering.decomposition.builder";
import type { EngineeringDecompositionReport } from "./engineering.types";

export function runEngineeringDecomposition(input?: {
  deploymentId?: string;
}): EngineeringDecompositionReport {
  return buildEngineeringDecomposition(input);
}

export function formatEngineeringDecompositionSummary(
  report: EngineeringDecompositionReport,
): string {
  return [
    "V80 APP Engineering Decomposition",
    `  ready: ${report.decompositionReady}`,
    `  score: ${report.readinessScore}/100`,
    `  productCompiler: ${report.productCompilerReady}`,
    `  folders: ${report.manifest.folderCount}`,
    `  prismaModules: ${report.manifest.prismaModuleCount}`,
    `  apiSpecs: ${report.manifest.apiSpecCount}`,
    `  dagNodes: ${report.manifest.dagNodeCount}`,
  ].join("\n");
}
