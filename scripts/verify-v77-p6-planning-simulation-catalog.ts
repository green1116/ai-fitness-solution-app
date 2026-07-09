/**
 * V77 P6 — Planning Simulation Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  PLANNING_SIMULATION_CATALOG_ENTRIES,
  PLANNING_SIMULATION_VALIDATION_CATALOG,
  V77_PLANNING_SIMULATION_FREEZE_VERSION,
  V77_PLANNING_SIMULATION_VERSION,
  assertPlanningSimulationCatalogPass,
  buildPlanningSimulationCatalog,
  computePlanningDeclarativeSimulationDeclared,
  formatPlanningSimulationCatalogSummary,
  getPlanningSimulationCatalogEntriesByKind,
  getPlanningSimulationCatalogEntryById,
  getPlanningSimulationValidationBySimulationRef,
  isPlanningSimulationCatalogRefsAligned,
  runPlanningSimulationCatalog,
} from "../lib/planning/v77/planning.simulation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v77-p6-planning-simulation-catalog";

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
    "lib/planning/v77/planning.simulation.ts",
    "lib/planning/v77/planning.simulation.catalog.ts",
    "lib/planning/v77/planning.simulation.builder.ts",
    "lib/planning/v77/planning.simulation.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V77 planning simulation catalog module structure");
}

function testInventories() {
  check(PLANNING_SIMULATION_CATALOG_ENTRIES.length === 8, "simulation catalog entries");
  check(PLANNING_SIMULATION_VALIDATION_CATALOG.length === 8, "simulation validation catalog");
  check(isPlanningSimulationCatalogRefsAligned(), "simulation catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getPlanningSimulationCatalogEntriesByKind(kind).length >= 1, `${kind} simulation kind`);
  }
  console.log("✓ simulations, validations, kinds & alignment");
}

function testSimulationFields() {
  for (const sim of PLANNING_SIMULATION_CATALOG_ENTRIES) {
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
  const shared = getPlanningSimulationCatalogEntryById("PLN-SIM-001");
  check(shared?.kind === "shared", "PLN-SIM-001 shared");
  check(
    shared?.expectedResult === "upstream-collaboration-freeze-intact",
    "PLN-SIM-001 expected result",
  );

  const boundary = getPlanningSimulationCatalogEntriesByKind("boundary");
  check(boundary.length >= 1, "boundary simulations");

  const governance = getPlanningSimulationCatalogEntryById("PLN-SIM-006");
  check(governance?.kind === "governance", "PLN-SIM-006 governance");

  const validation = getPlanningSimulationValidationBySimulationRef("PLN-SIM-008");
  check(validation?.validationKind === "boundary", "PLN-SIM-008 boundary validation");

  check(
    computePlanningDeclarativeSimulationDeclared({
      kind: "shared",
      expectedResult: "upstream-collaboration-freeze-intact",
    }),
    "shared declared",
  );
  check(
    !computePlanningDeclarativeSimulationDeclared({ kind: "topology", expectedResult: "" }),
    "topology empty not declared",
  );

  console.log("✓ simulation queries");
}

function testReport() {
  const incomplete = runPlanningSimulationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { planningEvaluationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete evaluation catalog not ready");

  const ready = buildPlanningSimulationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V77_PLANNING_SIMULATION_VERSION, "simulation catalog version");
  check(ready.freezeVersion === V77_PLANNING_SIMULATION_FREEZE_VERSION, "freeze version");
  check(ready.planningEvaluationCatalogReady, "P5 evaluation catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertPlanningSimulationCatalogPass(ready);

  console.log("✓ planning simulation catalog report");
  console.log(formatPlanningSimulationCatalogSummary(ready));
  console.log("\n✅ V77 P6 Planning Simulation Catalog — verify PASS");
}

function main() {
  console.log("V77 P6 Planning Simulation Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testSimulationFields();
  testSimulationQueries();
  testReport();
}

main();
