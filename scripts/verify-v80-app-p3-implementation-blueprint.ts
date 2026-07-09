/**
 * V80 APP P3 — Implementation Blueprint Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  API_IMPLEMENTATION_SPECS,
  PDF_PIPELINE_BLUEPRINTS,
  PRISMA_RELATION_MODEL,
  TENDER_PACK_EXECUTION_BLUEPRINT,
  V80_APP_BLUEPRINT_VERSION,
  assertImplementationBlueprintPass,
  buildImplementationBlueprint,
  formatImplementationBlueprintSummary,
  getApiImplementationByRoute,
  getPdfPipelineByType,
  getPrismaRelationsForModel,
  getWorkflowStepBlueprint,
  isApiImplementationSpecComplete,
  isPdfPipelineBlueprintComplete,
  isPrismaRelationModelComplete,
  isWorkflowExecutionBlueprintComplete,
  runImplementationBlueprint,
} from "../lib/app/v80/blueprint.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-app-p3-implementation-blueprint";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/app/v80/blueprint.types.ts",
    "lib/app/v80/blueprint.api.impl.ts",
    "lib/app/v80/blueprint.prisma.relations.ts",
    "lib/app/v80/blueprint.workflow.execution.ts",
    "lib/app/v80/blueprint.pdf.pipeline.ts",
    "lib/app/v80/blueprint.builder.ts",
    "lib/app/v80/blueprint.entry.ts",
    "docs/V80-APP-P3-IMPLEMENTATION-BLUEPRINT.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ V80 APP implementation blueprint module structure");
}

function testSpecs() {
  check(API_IMPLEMENTATION_SPECS.length === 8, "api implementation specs");
  check(PRISMA_RELATION_MODEL.length === 10, "prisma relations");
  check(TENDER_PACK_EXECUTION_BLUEPRINT.steps.length === 8, "workflow steps");
  check(PDF_PIPELINE_BLUEPRINTS.length === 4, "pdf pipelines");
  check(isApiImplementationSpecComplete(), "api specs complete");
  check(isPrismaRelationModelComplete(), "relations complete");
  check(isWorkflowExecutionBlueprintComplete(), "workflow complete");
  check(isPdfPipelineBlueprintComplete(), "pdf complete");

  const budget = getApiImplementationByRoute("/api/budget/calculate");
  check(budget?.service.function.includes("calculateBudget") === true, "budget service");
  check(budget?.errors.some((e) => e.code === "FEATURE_GATE") === true, "budget gate error");

  check(getPrismaRelationsForModel("Budget").length >= 1, "Budget relations");
  check(getWorkflowStepBlueprint("budget-pdf")?.maxRetries === 2, "pdf retry");
  check(getPdfPipelineByType("budget")?.entry.includes("renderBudgetPdf") === true, "budget pdf entry");

  console.log("✓ api, prisma, workflow & pdf pipeline specs");
}

function testReport() {
  const ready = buildImplementationBlueprint({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_APP_BLUEPRINT_VERSION, "blueprint version");
  check(ready.engineeringDecompositionReady, "P2 engineering ready");
  check(ready.manifest.blueprintComplete, "blueprint complete");
  check(ready.blueprintReady, "blueprint ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertImplementationBlueprintPass(ready);

  const run = runImplementationBlueprint({ deploymentId: DEPLOYMENT_ID });
  check(run.blueprintReady, "run ready");

  console.log("✓ implementation blueprint report");
  console.log(formatImplementationBlueprintSummary(ready));
  console.log("\n✅ V80 APP P3 Implementation Blueprint — verify PASS");
}

function main() {
  console.log("V80 APP P3 Implementation Blueprint Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();
