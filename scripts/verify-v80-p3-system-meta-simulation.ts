/**
 * V80 P3 — System Meta Simulation Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  SYSTEM_FAILURE_SCENARIOS,
  SYSTEM_PRE_RUNTIME_VIOLATION_RULES,
  SYSTEM_SIMULATION_CATALOG,
  SYSTEM_STATE_PROPAGATION_SEGMENTS,
  V80_SYSTEM_SIMULATION_FREEZE_VERSION,
  V80_SYSTEM_SIMULATION_VERSION,
  assertSystemSimulationCatalogPass,
  buildSystemSimulationCatalog,
  computeSystemDeclarativeSimulationDeclared,
  formatSystemSimulationCatalogSummary,
  getSystemFailureScenarioByKind,
  getSystemPropagationSegmentById,
  getSystemSimulationById,
  getSystemSimulationsByKind,
  isSystemFailureScenarioSetComplete,
  isSystemPreRuntimeViolationRulesComplete,
  isSystemSimulationCatalogRefsAligned,
  isSystemStatePropagationComplete,
  runSystemSimulationCatalog,
} from "../lib/system/v80/system.simulation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-p3-system-meta-simulation";
const STACK_LAYERS = ["V76", "V77", "V78", "V79"];

const REQUIRED_KINDS = ["flow", "propagation", "policy", "invariant", "violation", "failure"] as const;
const FAILURE_KINDS = ["orphan", "desync", "bypass", "freeze-conflict"] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/system/v80/system.simulation.ts",
    "lib/system/v80/system.simulation.catalog.ts",
    "lib/system/v80/system.simulation.propagation.ts",
    "lib/system/v80/system.simulation.violation.ts",
    "lib/system/v80/system.simulation.failure.ts",
    "lib/system/v80/system.simulation.builder.ts",
    "lib/system/v80/system.simulation.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V80 system meta simulation module structure");
}

function testCatalogs() {
  check(SYSTEM_SIMULATION_CATALOG.length === 6, "SYS-SIM-001…006");
  check(SYSTEM_STATE_PROPAGATION_SEGMENTS.length === 4, "propagation segments");
  check(SYSTEM_PRE_RUNTIME_VIOLATION_RULES.length === 6, "violation rules");
  check(SYSTEM_FAILURE_SCENARIOS.length === 4, "failure scenarios");
  check(isSystemSimulationCatalogRefsAligned(), "simulation refs aligned");
  check(isSystemStatePropagationComplete(), "propagation complete");
  check(isSystemPreRuntimeViolationRulesComplete(), "violations complete");
  check(isSystemFailureScenarioSetComplete(), "failures complete");
  for (const kind of REQUIRED_KINDS) {
    check(getSystemSimulationsByKind(kind).length >= 1, `${kind} simulation kind`);
  }
  console.log("✓ simulations, propagation, violations & failures");
}

function testCrossLayerAndPolicyInput() {
  for (const sim of SYSTEM_SIMULATION_CATALOG) {
    check(sim.layerRefs.length === 4, `${sim.id} spans 4 layers`);
    for (const layer of STACK_LAYERS) {
      check(sim.layerRefs.includes(layer), `${sim.id} includes ${layer}`);
    }
    check(sim.policyRef.startsWith("SYS-POL-"), `${sim.id} policyRef`);
    check(sim.invariantRef.startsWith("SYS-INV-"), `${sim.id} invariantRef`);
    check(sim.assumptions.some((a) => a.includes("no-runtime") || a.includes("declarative")), `${sim.id} declarative assumption`);
  }

  const prp = getSystemPropagationSegmentById("SYS-PRP-001");
  check(prp?.fromLayer === "V76" && prp?.toLayer === "V77", "V76→V77 propagation");
  const endToEnd = getSystemPropagationSegmentById("SYS-PRP-004");
  check(endToEnd?.toLayer === "V79", "end-to-end propagation to V79");

  console.log("✓ cross-layer flow & V80 POL+INV input");
}

function testFailureScenarios() {
  for (const kind of FAILURE_KINDS) {
    const scenario = getSystemFailureScenarioByKind(kind);
    check(scenario != null, `${kind} failure scenario`);
    check(scenario!.policyRef.startsWith("SYS-POL-"), `${kind} policyRef`);
    check(scenario!.invariantRef.startsWith("SYS-INV-"), `${kind} invariantRef`);
  }

  check(
    computeSystemDeclarativeSimulationDeclared({
      kind: "flow",
      expectedResult: "cross-layer-map-documented",
    }),
    "flow declared",
  );
  check(
    !computeSystemDeclarativeSimulationDeclared({ kind: "failure", expectedResult: "" }),
    "failure empty not declared",
  );

  console.log("✓ failure scenarios orphan/desync/bypass/freeze-conflict");
}

function testReport() {
  const incomplete = runSystemSimulationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { systemPolicyCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete policy catalog not ready");

  const ready = buildSystemSimulationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_SYSTEM_SIMULATION_VERSION, "simulation version");
  check(ready.freezeVersion === V80_SYSTEM_SIMULATION_FREEZE_VERSION, "freeze version");
  check(ready.systemPolicyCatalogReady, "P2 policy catalog ready");
  check(ready.catalog.catalogComplete, "simulations complete");
  check(ready.propagation.propagationComplete, "propagation complete");
  check(ready.violations.rulesComplete, "violations complete");
  check(ready.failures.scenariosComplete, "failures complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertSystemSimulationCatalogPass(ready);

  const sim = getSystemSimulationById("SYS-SIM-003");
  check(sim?.kind === "policy", "SYS-SIM-003 policy");

  console.log("✓ system meta simulation report");
  console.log(formatSystemSimulationCatalogSummary(ready));
  console.log("\n✅ V80 P3 System Meta Simulation — verify PASS");
}

function main() {
  console.log("V80 P3 System Meta Simulation Verification\n");
  checkModuleStructure();
  testCatalogs();
  testCrossLayerAndPolicyInput();
  testFailureScenarios();
  testReport();
}

main();
