/**
 * V80 CODE P1 — Code scaffold entry
 */
export { assertCodeScaffoldPass, buildCodeScaffold } from "./scaffold.builder";
export { formatScaffoldFolderTree, SCAFFOLD_FOLDER_TREE } from "./scaffold.tree";
export {
  getScaffoldModulesByKind,
  SCAFFOLD_MODULE_REGISTRY,
} from "./scaffold.registry";
export { V80_PRISMA_ENTITIES, V80_PRISMA_SKELETON_PATH } from "./scaffold.prisma";
export { V80_CODE_SCAFFOLD_FREEZE_VERSION, V80_CODE_SCAFFOLD_VERSION } from "./scaffold.types";
export type { ScaffoldModuleStub, ScaffoldReport } from "./scaffold.types";

import { buildCodeScaffold } from "./scaffold.builder";
import type { ScaffoldReport } from "./scaffold.types";

export function runCodeScaffold(input?: { deploymentId?: string }): ScaffoldReport {
  return buildCodeScaffold(input);
}

export function formatCodeScaffoldSummary(report: ScaffoldReport): string {
  return [
    "V80 CODE Scaffold",
    `  ready: ${report.scaffoldReady}`,
    `  score: ${report.readinessScore}/100`,
    `  production: ${report.productionReady}`,
    `  folders: ${report.manifest.folderCount}`,
    `  modules: ${report.manifest.moduleCount}`,
    `  routes: ${report.manifest.routeCount}`,
    `  prisma: ${report.manifest.prismaSkeleton}`,
  ].join("\n");
}
