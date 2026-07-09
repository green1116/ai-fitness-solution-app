/**
 * V80 APP P2 — Engineering decomposition builder (read-only P1 consumer)
 */
import { buildProductCompiler } from "./product.compiler.builder";
import { V80_APP_PRODUCT_COMPILER_VERSION } from "./product.compiler";
import { isEngineeringApiSpecComplete, ENGINEERING_API_SPECS } from "./engineering.api.spec";
import {
  isEngineeringFolderStructureComplete,
  ENGINEERING_FOLDER_STRUCTURE,
} from "./engineering.folder.spec";
import {
  isEngineeringPrismaBreakdownComplete,
  ENGINEERING_PRISMA_MODULES,
} from "./engineering.prisma.spec";
import {
  TENDER_PACK_WORKFLOW_DAG,
  isEngineeringWorkflowDagComplete,
} from "./engineering.workflow.dag";
import type {
  EngineeringDecompositionManifest,
  EngineeringDecompositionReport,
} from "./engineering.types";
import {
  V80_APP_ENGINEERING_FREEZE_VERSION,
  V80_APP_ENGINEERING_VERSION,
} from "./engineering.types";

export function buildEngineeringDecompositionManifest(input: {
  productCompilerReady: boolean;
}): EngineeringDecompositionManifest {
  const folderComplete = isEngineeringFolderStructureComplete();
  const prismaComplete = isEngineeringPrismaBreakdownComplete();
  const apiComplete = isEngineeringApiSpecComplete();
  const dagComplete = isEngineeringWorkflowDagComplete();

  const decompositionComplete =
    input.productCompilerReady && folderComplete && prismaComplete && apiComplete && dagComplete;

  return {
    version: V80_APP_ENGINEERING_VERSION,
    productCompilerVersion: V80_APP_PRODUCT_COMPILER_VERSION,
    folderCount: ENGINEERING_FOLDER_STRUCTURE.length,
    prismaModuleCount: ENGINEERING_PRISMA_MODULES.length,
    apiSpecCount: ENGINEERING_API_SPECS.length,
    dagNodeCount: TENDER_PACK_WORKFLOW_DAG.nodes.length,
    decompositionComplete,
    summary: `engineering-decomposition complete=${decompositionComplete} folders=${ENGINEERING_FOLDER_STRUCTURE.length} apis=${ENGINEERING_API_SPECS.length}`,
  };
}

export function buildEngineeringDecomposition(input?: {
  deploymentId?: string;
}): EngineeringDecompositionReport {
  const deploymentId = input?.deploymentId ?? "v80-app-engineering-default";
  const productCompiler = buildProductCompiler({ deploymentId });
  const manifest = buildEngineeringDecompositionManifest({
    productCompilerReady: productCompiler.compilerReady,
  });

  const decompositionReady = productCompiler.compilerReady && manifest.decompositionComplete;

  return {
    version: V80_APP_ENGINEERING_VERSION,
    freezeVersion: V80_APP_ENGINEERING_FREEZE_VERSION,
    reportId: `engineering-decomposition-${deploymentId}`,
    productCompilerReady: productCompiler.compilerReady,
    manifest,
    folders: ENGINEERING_FOLDER_STRUCTURE,
    prismaModules: ENGINEERING_PRISMA_MODULES,
    apiSpecs: ENGINEERING_API_SPECS,
    workflowDag: TENDER_PACK_WORKFLOW_DAG,
    decompositionReady,
    readinessScore: decompositionReady ? 100 : 0,
    summary: [
      `engineering-decomposition ready=${decompositionReady}`,
      `productCompiler=${productCompiler.compilerReady}`,
      `dagNodes=${manifest.dagNodeCount}`,
    ].join(" "),
  };
}

export function assertEngineeringDecompositionPass(
  report: EngineeringDecompositionReport,
): asserts report is EngineeringDecompositionReport & { decompositionReady: true } {
  if (!report.decompositionReady) {
    throw new Error(`V80 APP engineering decomposition not ready: ${report.summary}`);
  }
}
