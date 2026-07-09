/**
 * V80 CODE P1 — Scaffold builder (read-only P4 consumer)
 */
import { buildProductionArchitecture } from "@/lib/app/v80/production.builder";
import { V80_APP_PRODUCTION_VERSION } from "@/lib/app/v80/production.types";
import { isPrismaSkeletonComplete, V80_PRISMA_SKELETON_PATH } from "./scaffold.prisma";
import {
  isScaffoldModuleRegistryComplete,
  SCAFFOLD_MODULE_REGISTRY,
} from "./scaffold.registry";
import { isScaffoldFolderTreeComplete, SCAFFOLD_FOLDER_TREE } from "./scaffold.tree";
import type { ScaffoldManifest, ScaffoldReport } from "./scaffold.types";
import { V80_CODE_SCAFFOLD_FREEZE_VERSION, V80_CODE_SCAFFOLD_VERSION } from "./scaffold.types";

export function buildScaffoldManifest(input: { productionReady: boolean }): ScaffoldManifest {
  const folderComplete = isScaffoldFolderTreeComplete();
  const moduleComplete = isScaffoldModuleRegistryComplete();
  const prismaComplete = isPrismaSkeletonComplete();

  const scaffoldComplete = input.productionReady && folderComplete && moduleComplete && prismaComplete;

  return {
    version: V80_CODE_SCAFFOLD_VERSION,
    productionVersion: V80_APP_PRODUCTION_VERSION,
    folderCount: SCAFFOLD_FOLDER_TREE.length,
    moduleCount: SCAFFOLD_MODULE_REGISTRY.length,
    routeCount: SCAFFOLD_MODULE_REGISTRY.filter((m) => m.kind === "route").length,
    prismaSkeleton: V80_PRISMA_SKELETON_PATH,
    scaffoldComplete,
    summary: `code-scaffold complete=${scaffoldComplete} modules=${SCAFFOLD_MODULE_REGISTRY.length}`,
  };
}

export function buildCodeScaffold(input?: { deploymentId?: string }): ScaffoldReport {
  const deploymentId = input?.deploymentId ?? "v80-code-scaffold-default";
  const production = buildProductionArchitecture({ deploymentId });
  const manifest = buildScaffoldManifest({ productionReady: production.architectureReady });

  const scaffoldReady = production.architectureReady && manifest.scaffoldComplete;

  return {
    version: V80_CODE_SCAFFOLD_VERSION,
    freezeVersion: V80_CODE_SCAFFOLD_FREEZE_VERSION,
    reportId: `code-scaffold-${deploymentId}`,
    productionReady: production.architectureReady,
    manifest,
    folders: SCAFFOLD_FOLDER_TREE,
    modules: SCAFFOLD_MODULE_REGISTRY,
    scaffoldReady,
    readinessScore: scaffoldReady ? 100 : 0,
    summary: `code-scaffold ready=${scaffoldReady} production=${production.architectureReady}`,
  };
}

export function assertCodeScaffoldPass(
  report: ScaffoldReport,
): asserts report is ScaffoldReport & { scaffoldReady: true } {
  if (!report.scaffoldReady) {
    throw new Error(`V80 CODE scaffold not ready: ${report.summary}`);
  }
}
