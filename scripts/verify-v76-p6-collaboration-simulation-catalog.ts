/**
 * V76 P6 — Collaboration Simulation Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  COLLABORATION_SIMULATION_CATALOG_ENTRIES,
  COLLABORATION_SIMULATION_VALIDATION_CATALOG,
  V76_COLLABORATION_SIMULATION_FREEZE_VERSION,
  V76_COLLABORATION_SIMULATION_VERSION,
  assertCollaborationSimulationCatalogPass,
  buildCollaborationSimulationCatalog,
  computeCollaborationDeclarativeSimulationDeclared,
  formatCollaborationSimulationCatalogSummary,
  getCollaborationSimulationCatalogEntriesByKind,
  getCollaborationSimulationCatalogEntryById,
  getCollaborationSimulationValidationBySimulationRef,
  isCollaborationSimulationCatalogRefsAligned,
  runCollaborationSimulationCatalog,
} from "../lib/collaboration/v76/collaboration.simulation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v76-p6-collaboration-simulation-catalog";

const REQUIRED_KINDS = [
  "shared",
  "topology",
  "communication",
  "delegation",
  "coordination",
  "governance",
  "workspace",
  "boundary",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/collaboration/v76/collaboration.simulation.ts",
    "lib/collaboration/v76/collaboration.simulation.catalog.ts",
    "lib/collaboration/v76/collaboration.simulation.builder.ts",
    "lib/collaboration/v76/collaboration.simulation.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V76 collaboration simulation catalog module structure");
}

function testInventories() {
  check(COLLABORATION_SIMULATION_CATALOG_ENTRIES.length === 8, "simulation catalog entries");
  check(COLLABORATION_SIMULATION_VALIDATION_CATALOG.length === 8, "simulation validation catalog");
  check(isCollaborationSimulationCatalogRefsAligned(), "simulation catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getCollaborationSimulationCatalogEntriesByKind(kind).length >= 1, `${kind} simulation kind`);
  }
  console.log("✓ simulations, validations, kinds & alignment");
}

function testSimulationFields() {
  for (const sim of COLLABORATION_SIMULATION_CATALOG_ENTRIES) {
    check(sim.scenario.length > 0, `${sim.id} scenario`);
    check(sim.purpose.length > 0, `${sim.id} purpose`);
    check(sim.inputs.length >= 1, `${sim.id} inputs`);
    check(sim.outputs.length >= 1, `${sim.id} outputs`);
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
  const shared = getCollaborationSimulationCatalogEntryById("COL-SIM-001");
  check(shared?.kind === "shared", "COL-SIM-001 shared");
  check(shared?.expectedResult === "upstream-agent-freeze-intact", "COL-SIM-001 expected result");

  const boundary = getCollaborationSimulationCatalogEntriesByKind("boundary");
  check(boundary.length >= 1, "boundary simulations");

  const governance = getCollaborationSimulationCatalogEntryById("COL-SIM-006");
  check(governance?.kind === "governance", "COL-SIM-006 governance");

  const validation = getCollaborationSimulationValidationBySimulationRef("COL-SIM-008");
  check(validation?.validationKind === "boundary", "COL-SIM-008 boundary validation");

  check(
    computeCollaborationDeclarativeSimulationDeclared({
      kind: "shared",
      expectedResult: "upstream-agent-freeze-intact",
    }),
    "shared declared",
  );
  check(
    !computeCollaborationDeclarativeSimulationDeclared({ kind: "topology", expectedResult: "" }),
    "topology empty not declared",
  );

  console.log("✓ simulation queries");
}

function testReport() {
  const incomplete = runCollaborationSimulationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { collaborationEvaluationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete evaluation catalog not ready");

  const ready = buildCollaborationSimulationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V76_COLLABORATION_SIMULATION_VERSION, "simulation catalog version");
  check(ready.freezeVersion === V76_COLLABORATION_SIMULATION_FREEZE_VERSION, "freeze version");
  check(ready.collaborationEvaluationCatalogReady, "P5 evaluation catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertCollaborationSimulationCatalogPass(ready);

  console.log("✓ collaboration simulation catalog report");
  console.log(formatCollaborationSimulationCatalogSummary(ready));
  console.log("\n✅ V76 P6 Collaboration Simulation Catalog — verify PASS");
}

function main() {
  console.log("V76 P6 Collaboration Simulation Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testSimulationFields();
  testSimulationQueries();
  testReport();
}

main();
