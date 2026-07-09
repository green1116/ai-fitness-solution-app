/**
 * V80 CODE P1 — Code Scaffold Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  SCAFFOLD_MODULE_REGISTRY,
  V80_CODE_SCAFFOLD_VERSION,
  V80_PRISMA_SKELETON_PATH,
  assertCodeScaffoldPass,
  buildCodeScaffold,
  formatCodeScaffoldSummary,
  formatScaffoldFolderTree,
  getScaffoldModulesByKind,
  runCodeScaffold,
} from "../lib/code/v80/scaffold.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-code-p1-scaffold";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  for (const mod of SCAFFOLD_MODULE_REGISTRY) {
    if (mod.path.endsWith(".prisma")) continue;
    check(fs.existsSync(path.join(ROOT, mod.path)), `missing stub: ${mod.path}`);
  }
  check(fs.existsSync(path.join(ROOT, V80_PRISMA_SKELETON_PATH)), "prisma skeleton");
  console.log("✓ scaffold stubs on disk");
}

function testRegistry() {
  check(getScaffoldModulesByKind("route").length === 8, "8 route scaffolds");
  check(getScaffoldModulesByKind("service").length >= 4, "service stubs");
  check(getScaffoldModulesByKind("pdf").length === 4, "pdf stubs");
  check(getScaffoldModulesByKind("workflow").length >= 2, "workflow stubs");
  console.log("✓ module registry");
  console.log(formatScaffoldFolderTree());
}

function testReport() {
  const ready = buildCodeScaffold({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_CODE_SCAFFOLD_VERSION, "scaffold version");
  check(ready.productionReady, "P4 production ready");
  check(ready.manifest.scaffoldComplete, "scaffold complete");
  check(ready.scaffoldReady, "scaffold ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertCodeScaffoldPass(ready);

  console.log("✓ code scaffold report");
  console.log(formatCodeScaffoldSummary(ready));
  console.log("\n✅ V80 CODE P1 Scaffold — verify PASS");
}

function main() {
  console.log("V80 CODE P1 Code Scaffold Verification\n");
  checkModuleStructure();
  testRegistry();
  testReport();
}

main();
