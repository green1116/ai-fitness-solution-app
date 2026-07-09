/**
 * V79 P6 — Task Simulation Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  TASK_SIMULATION_CATALOG_ENTRIES,
  TASK_SIMULATION_VALIDATION_CATALOG,
  V79_TASK_SIMULATION_FREEZE_VERSION,
  V79_TASK_SIMULATION_VERSION,
  assertTaskSimulationCatalogPass,
  buildTaskSimulationCatalog,
  computeTaskDeclarativeSimulationDeclared,
  formatTaskSimulationCatalogSummary,
  getTaskSimulationCatalogEntriesByKind,
  getTaskSimulationCatalogEntryById,
  getTaskSimulationValidationBySimulationRef,
  isTaskSimulationCatalogRefsAligned,
  runTaskSimulationCatalog,
} from "../lib/task/v79/task.simulation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v79-p6-task-simulation-catalog";

const REQUIRED_KINDS = [
  "shared",
  "role",
  "state",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/task/v79/task.simulation.ts",
    "lib/task/v79/task.simulation.catalog.ts",
    "lib/task/v79/task.simulation.builder.ts",
    "lib/task/v79/task.simulation.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V79 task simulation catalog module structure");
}

function testInventories() {
  check(TASK_SIMULATION_CATALOG_ENTRIES.length === 8, "simulation catalog entries");
  check(TASK_SIMULATION_VALIDATION_CATALOG.length === 8, "simulation validation catalog");
  check(isTaskSimulationCatalogRefsAligned(), "simulation catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getTaskSimulationCatalogEntriesByKind(kind).length >= 1, `${kind} simulation kind`);
  }
  console.log("✓ simulations, validations, kinds & alignment");
}

function testSimulationFields() {
  for (const sim of TASK_SIMULATION_CATALOG_ENTRIES) {
    check(sim.scenario.length > 0, `${sim.id} scenario`);
    check(sim.purpose.length > 0, `${sim.id} purpose`);
    check(sim.roleRef.length > 0, `${sim.id} roleRef`);
    check(sim.stateRef.length > 0, `${sim.id} stateRef`);
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
  const shared = getTaskSimulationCatalogEntryById("TSK-SIM-001");
  check(shared?.kind === "shared", "TSK-SIM-001 shared");
  check(shared?.expectedResult === "upstream-execution-freeze-intact", "TSK-SIM-001 expected result");

  const state = getTaskSimulationCatalogEntriesByKind("state");
  check(state.length >= 1, "state simulations");
  check(state[0]?.evaluationRef === "TSK-EVAL-003", "state simulation evaluation ref");

  const boundary = getTaskSimulationCatalogEntryById("TSK-SIM-008");
  check(boundary?.kind === "boundary", "TSK-SIM-008 boundary");
  check(boundary?.assumptions.includes("v48-v79-p5-frozen") === true, "TSK-SIM-008 frozen assumption");

  const validation = getTaskSimulationValidationBySimulationRef("TSK-SIM-008");
  check(validation?.validationKind === "boundary", "TSK-SIM-008 boundary validation");

  check(
    computeTaskDeclarativeSimulationDeclared({
      kind: "shared",
      expectedResult: "upstream-execution-freeze-intact",
    }),
    "shared declared",
  );
  check(
    !computeTaskDeclarativeSimulationDeclared({ kind: "topology", expectedResult: "" }),
    "topology empty not declared",
  );

  console.log("✓ simulation queries");
}

function testReport() {
  const incomplete = runTaskSimulationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { taskEvaluationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete evaluation catalog not ready");

  const ready = buildTaskSimulationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V79_TASK_SIMULATION_VERSION, "simulation catalog version");
  check(ready.freezeVersion === V79_TASK_SIMULATION_FREEZE_VERSION, "freeze version");
  check(ready.taskEvaluationCatalogReady, "P5 evaluation catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertTaskSimulationCatalogPass(ready);

  console.log("✓ task simulation catalog report");
  console.log(formatTaskSimulationCatalogSummary(ready));
  console.log("\n✅ V79 P6 Task Simulation Catalog — verify PASS");
}

function main() {
  console.log("V79 P6 Task Simulation Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testSimulationFields();
  testSimulationQueries();
  testReport();
}

main();
