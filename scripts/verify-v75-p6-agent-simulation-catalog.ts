/**
 * V75 P6 — Agent Simulation Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  AGENT_SIMULATION_CATALOG_ENTRIES,
  AGENT_SIMULATION_VALIDATION_CATALOG,
  assertAgentSimulationCatalogPass,
  buildAgentSimulationCatalog,
  computeAgentDeclarativeSimulationDeclared,
  formatAgentSimulationCatalogSummary,
  getAgentSimulationCatalogEntriesByType,
  getAgentSimulationCatalogEntryById,
  getAgentSimulationValidationBySimulationRef,
  isAgentSimulationCatalogRefsAligned,
  runAgentSimulationCatalog,
  V75_AGENT_SIMULATION_FREEZE_VERSION,
  V75_AGENT_SIMULATION_VERSION,
} from "../lib/agent/v75/agent.simulation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v75-p6-agent-simulation-catalog";

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
    "lib/agent/v75/agent.simulation.ts",
    "lib/agent/v75/agent.simulation.catalog.ts",
    "lib/agent/v75/agent.simulation.builder.ts",
    "lib/agent/v75/agent.simulation.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V75 agent simulation catalog module structure");
}

function testInventories() {
  check(AGENT_SIMULATION_CATALOG_ENTRIES.length === 8, "simulation catalog entries");
  check(AGENT_SIMULATION_VALIDATION_CATALOG.length === 8, "simulation validation catalog");
  check(isAgentSimulationCatalogRefsAligned(), "simulation catalog refs aligned");
  for (const type of REQUIRED_TYPES) {
    check(getAgentSimulationCatalogEntriesByType(type).length >= 1, `${type} simulation type`);
  }
  console.log("✓ simulations, validations, types & alignment");
}

function testSimulationFields() {
  for (const sim of AGENT_SIMULATION_CATALOG_ENTRIES) {
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
  const dryRun = getAgentSimulationCatalogEntryById("AGT-SIM-001");
  check(dryRun?.type === "dryRun", "AGT-SIM-001 dryRun");
  check(dryRun?.expectedResult === "readiness-score=100", "AGT-SIM-001 expected result");

  const rollback = getAgentSimulationCatalogEntriesByType("rollbackPreview");
  check(rollback.length >= 1, "rollbackPreview simulations");

  const forecast = getAgentSimulationCatalogEntryById("AGT-SIM-006");
  check(forecast?.type === "forecast", "AGT-SIM-006 forecast");

  const validation = getAgentSimulationValidationBySimulationRef("AGT-SIM-008");
  check(validation?.validationKind === "rollbackPreview", "AGT-SIM-008 rollback validation");

  check(
    computeAgentDeclarativeSimulationDeclared({
      type: "dryRun",
      expectedResult: "readiness-score=100",
    }),
    "dryRun declared",
  );
  check(
    !computeAgentDeclarativeSimulationDeclared({ type: "scenario", expectedResult: "" }),
    "scenario empty not declared",
  );

  console.log("✓ simulation queries");
}

function testReport() {
  const incomplete = runAgentSimulationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { agentEvaluationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete evaluation catalog not ready");

  const ready = buildAgentSimulationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V75_AGENT_SIMULATION_VERSION, "simulation catalog version");
  check(ready.freezeVersion === V75_AGENT_SIMULATION_FREEZE_VERSION, "freeze version");
  check(ready.agentEvaluationCatalogReady, "P5 evaluation catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertAgentSimulationCatalogPass(ready);

  console.log("✓ agent simulation catalog report");
  console.log(formatAgentSimulationCatalogSummary(ready));
  console.log("\n✅ V75 P6 Agent Simulation Catalog — verify PASS");
}

function main() {
  console.log("V75 P6 Agent Simulation Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testSimulationFields();
  testSimulationQueries();
  testReport();
}

main();
