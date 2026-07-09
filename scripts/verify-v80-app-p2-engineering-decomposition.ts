/**
 * V80 APP P2 — Engineering Decomposition Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ENGINEERING_API_SPECS,
  ENGINEERING_FOLDER_STRUCTURE,
  ENGINEERING_PRISMA_MODULES,
  TENDER_PACK_WORKFLOW_DAG,
  V80_APP_ENGINEERING_VERSION,
  assertEngineeringDecompositionPass,
  buildEngineeringDecomposition,
  formatEngineeringDecompositionSummary,
  getEngineeringApiSpecByRoute,
  getEngineeringFoldersByKind,
  getEngineeringPrismaModuleByDomain,
  getWorkflowDagNodeByStep,
  isEngineeringApiSpecComplete,
  isEngineeringFolderStructureComplete,
  isEngineeringPrismaBreakdownComplete,
  isEngineeringWorkflowDagComplete,
  runEngineeringDecomposition,
} from "../lib/app/v80/engineering.decomposition.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-app-p2-engineering-decomposition";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/app/v80/engineering.types.ts",
    "lib/app/v80/engineering.folder.spec.ts",
    "lib/app/v80/engineering.prisma.spec.ts",
    "lib/app/v80/engineering.api.spec.ts",
    "lib/app/v80/engineering.workflow.dag.ts",
    "lib/app/v80/engineering.decomposition.builder.ts",
    "lib/app/v80/engineering.decomposition.entry.ts",
    "docs/V80-APP-P2-ENGINEERING-DECOMPOSITION.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ V80 APP engineering decomposition module structure");
}

function testSpecs() {
  check(ENGINEERING_FOLDER_STRUCTURE.length === 8, "folder structure");
  check(ENGINEERING_PRISMA_MODULES.length === 6, "prisma modules");
  check(ENGINEERING_API_SPECS.length === 8, "api specs");
  check(TENDER_PACK_WORKFLOW_DAG.nodes.length === 8, "dag nodes");
  check(TENDER_PACK_WORKFLOW_DAG.edges.length === 7, "dag edges");
  check(isEngineeringFolderStructureComplete(), "folders complete");
  check(isEngineeringPrismaBreakdownComplete(), "prisma complete");
  check(isEngineeringApiSpecComplete(), "api specs complete");
  check(isEngineeringWorkflowDagComplete(), "dag complete");

  check(getEngineeringFoldersByKind("pdf").length >= 1, "pdf folder");
  check(getEngineeringPrismaModuleByDomain("tender") != null, "tender domain");

  const budget = getEngineeringApiSpecByRoute("/api/budget/calculate");
  check(budget?.inputSchema.quoteId === "string", "budget input spec");

  const pdfNode = getWorkflowDagNodeByStep("budget-pdf");
  check(pdfNode?.pdfStage?.includes("renderBudgetPdf") === true, "budget pdf stage");

  console.log("✓ folder, prisma, api specs & workflow DAG");
}

function testReport() {
  const ready = buildEngineeringDecomposition({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_APP_ENGINEERING_VERSION, "engineering version");
  check(ready.productCompilerReady, "P1 product compiler ready");
  check(ready.manifest.decompositionComplete, "decomposition complete");
  check(ready.decompositionReady, "decomposition ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertEngineeringDecompositionPass(ready);

  const run = runEngineeringDecomposition({ deploymentId: DEPLOYMENT_ID });
  check(run.decompositionReady, "run ready");

  console.log("✓ engineering decomposition report");
  console.log(formatEngineeringDecompositionSummary(ready));
  console.log("\n✅ V80 APP P2 Engineering Decomposition — verify PASS");
}

function main() {
  console.log("V80 APP P2 Engineering Decomposition Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();
