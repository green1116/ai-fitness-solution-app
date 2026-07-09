/**
 * V78 P6 — Execution Simulation Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  EXECUTION_SIMULATION_CATALOG_ENTRIES,
  EXECUTION_SIMULATION_VALIDATION_CATALOG,
  V78_EXECUTION_SIMULATION_FREEZE_VERSION,
  V78_EXECUTION_SIMULATION_VERSION,
  assertExecutionSimulationCatalogPass,
  buildExecutionSimulationCatalog,
  computeExecutionDeclarativeSimulationDeclared,
  formatExecutionSimulationCatalogSummary,
  getExecutionSimulationCatalogEntriesByKind,
  getExecutionSimulationCatalogEntryById,
  getExecutionSimulationValidationBySimulationRef,
  isExecutionSimulationCatalogRefsAligned,
  runExecutionSimulationCatalog,
} from "../lib/execution/v78/execution.simulation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v78-p6-execution-simulation-catalog";

const REQUIRED_KINDS = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/execution/v78/execution.simulation.ts",
    "lib/execution/v78/execution.simulation.catalog.ts",
    "lib/execution/v78/execution.simulation.builder.ts",
    "lib/execution/v78/execution.simulation.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V78 execution simulation catalog module structure");
}

function testInventories() {
  check(EXECUTION_SIMULATION_CATALOG_ENTRIES.length === 8, "simulation catalog entries");
  check(EXECUTION_SIMULATION_VALIDATION_CATALOG.length === 8, "simulation validation catalog");
  check(isExecutionSimulationCatalogRefsAligned(), "simulation catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getExecutionSimulationCatalogEntriesByKind(kind).length >= 1, `${kind} simulation kind`);
  }
  console.log("✓ simulations, validations, kinds & alignment");
}

function testSimulationFields() {
  for (const sim of EXECUTION_SIMULATION_CATALOG_ENTRIES) {
    check(sim.scenario.length > 0, `${sim.id} scenario`);
    check(sim.purpose.length > 0, `${sim.id} purpose`);
    check(sim.roleRef.length > 0, `${sim.id} roleRef`);
    check(sim.topologyRef.length > 0, `${sim.id} topologyRef`);
    check(sim.dependencyRef.length > 0, `${sim.id} dependencyRef`);
    check(sim.branches.length >= 1, `${sim.id} branches`);
    check(sim.assumptions.length >= 1, `${sim.id} assumptions`);
    check(sim.expectedResult.length > 0, `${sim.id} expectedResult`);
    check(sim.priority.length > 0, `${sim.id} priority`);
    check(sim.validation.length > 0, `${sim.id} validation`);
    check(sim.evaluationRef.length > 0, `${sim.id} evaluationRef`);
    check(sim.contextRef.length > 0, `${sim.id} contextRef`);
  }
  console.log("✓ simulation field coverage");
}

function testSimulationQueries() {
  const shared = getExecutionSimulationCatalogEntryById("EXE-SIM-001");
  check(shared?.kind === "shared", "EXE-SIM-001 shared");
  check(
    shared?.expectedResult === "upstream-planning-freeze-intact",
    "EXE-SIM-001 expected result",
  );

  const boundary = getExecutionSimulationCatalogEntriesByKind("boundary");
  check(boundary.length >= 1, "boundary simulations");

  const governance = getExecutionSimulationCatalogEntryById("EXE-SIM-006");
  check(governance?.kind === "governance", "EXE-SIM-006 governance");

  const validation = getExecutionSimulationValidationBySimulationRef("EXE-SIM-008");
  check(validation?.validationKind === "boundary", "EXE-SIM-008 boundary validation");

  check(
    computeExecutionDeclarativeSimulationDeclared({
      kind: "shared",
      expectedResult: "upstream-planning-freeze-intact",
    }),
    "shared declared",
  );
  check(
    !computeExecutionDeclarativeSimulationDeclared({ kind: "topology", expectedResult: "" }),
    "topology empty not declared",
  );

  console.log("✓ simulation queries");
}

function testReport() {
  const incomplete = runExecutionSimulationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { executionEvaluationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete evaluation catalog not ready");

  const ready = buildExecutionSimulationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V78_EXECUTION_SIMULATION_VERSION, "simulation catalog version");
  check(ready.freezeVersion === V78_EXECUTION_SIMULATION_FREEZE_VERSION, "freeze version");
  check(ready.executionEvaluationCatalogReady, "P5 evaluation catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertExecutionSimulationCatalogPass(ready);

  console.log("✓ execution simulation catalog report");
  console.log(formatExecutionSimulationCatalogSummary(ready));
  console.log("\n✅ V78 P6 Execution Simulation Catalog — verify PASS");
}

function main() {
  console.log("V78 P6 Execution Simulation Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testSimulationFields();
  testSimulationQueries();
  testReport();
}

main();
