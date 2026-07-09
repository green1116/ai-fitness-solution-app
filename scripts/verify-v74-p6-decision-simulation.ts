/**
 * V74 P6 — Decision Simulation Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertDecisionSimulationCatalogPass,
  buildDecisionSimulationCatalog,
  computeDeclarativeSimulationDeclared,
  formatDecisionSimulationCatalogSummary,
  getSimulationCatalogEntriesByType,
  getSimulationCatalogEntryById,
  getSimulationValidationBySimulationRef,
  isDecisionSimulationCatalogRefsAligned,
  runDecisionSimulationCatalog,
  SIMULATION_CATALOG_ENTRIES,
  SIMULATION_VALIDATION_CATALOG,
  V74_DECISION_SIMULATION_FREEZE_VERSION,
  V74_DECISION_SIMULATION_VERSION,
} from "../lib/decision/v74/decision.simulation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v74-p6-decision-simulation";

const REQUIRED_TYPES = [
  "dryRun",
  "scenario",
  "alternative",
  "comparison",
  "ranking",
  "forecast",
  "sensitivity",
  "rollbackPreview",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/decision/v74/decision.simulation.ts",
    "lib/decision/v74/decision.simulation.catalog.ts",
    "lib/decision/v74/decision.simulation.builder.ts",
    "lib/decision/v74/decision.simulation.entry.ts",
    "docs/V74-DECISION-SIMULATION.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V74 decision simulation catalog module structure");
}

function testInventories() {
  check(SIMULATION_CATALOG_ENTRIES.length === 8, "simulation catalog entries");
  check(SIMULATION_VALIDATION_CATALOG.length === 8, "simulation validation catalog");
  check(isDecisionSimulationCatalogRefsAligned(), "simulation catalog refs aligned");
  for (const type of REQUIRED_TYPES) {
    check(getSimulationCatalogEntriesByType(type).length >= 1, `${type} simulation type`);
  }
  console.log("✓ simulations, validations, types & alignment");
}

function testSimulationFields() {
  for (const sim of SIMULATION_CATALOG_ENTRIES) {
    check(sim.purpose.length > 0, `${sim.id} purpose`);
    check(sim.inputs.length >= 1, `${sim.id} inputs`);
    check(sim.outputs.length >= 1, `${sim.id} outputs`);
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
  const dryRun = getSimulationCatalogEntryById("DEC-SIM-001");
  check(dryRun?.type === "dryRun", "DEC-SIM-001 dryRun");
  check(dryRun?.expectedResult === "readiness-score=100", "DEC-SIM-001 expected result");

  const rollback = getSimulationCatalogEntriesByType("rollbackPreview");
  check(rollback.length >= 1, "rollbackPreview simulations");

  const forecast = getSimulationCatalogEntryById("DEC-SIM-006");
  check(forecast?.type === "forecast", "DEC-SIM-006 forecast");

  const validation = getSimulationValidationBySimulationRef("DEC-SIM-008");
  check(validation?.validationKind === "rollbackPreview", "DEC-SIM-008 rollback validation");

  check(
    computeDeclarativeSimulationDeclared({
      type: "dryRun",
      expectedResult: "readiness-score=100",
    }),
    "dryRun declared",
  );
  check(
    !computeDeclarativeSimulationDeclared({ type: "scenario", expectedResult: "" }),
    "scenario empty not declared",
  );

  console.log("✓ simulation queries");
}

function testReport() {
  const incomplete = runDecisionSimulationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { decisionEvaluationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete evaluation catalog not ready");

  const ready = buildDecisionSimulationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V74_DECISION_SIMULATION_VERSION, "simulation catalog version");
  check(ready.freezeVersion === V74_DECISION_SIMULATION_FREEZE_VERSION, "freeze version");
  check(ready.decisionEvaluationCatalogReady, "P5 evaluation catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertDecisionSimulationCatalogPass(ready);

  console.log("✓ decision simulation catalog report");
  console.log(formatDecisionSimulationCatalogSummary(ready));
  console.log("\n✅ V74 P6 Decision Simulation Catalog — verify PASS");
}

function main() {
  console.log("V74 P6 Decision Simulation Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testSimulationFields();
  testSimulationQueries();
  testReport();
}

main();
