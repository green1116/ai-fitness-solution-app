/**
 * V80 P3 — System meta simulation entry (read-only)
 */
export {
  SYSTEM_SIMULATION_CATALOG,
  buildSystemSimulationCatalogManifest,
  computeSystemDeclarativeSimulationDeclared,
  getSystemSimulationById,
  getSystemSimulationsByKind,
  isSystemSimulationCatalogRefsAligned,
} from "./system.simulation.catalog";
export {
  SYSTEM_STATE_PROPAGATION_SEGMENTS,
  buildSystemStatePropagationManifest,
  getSystemPropagationSegmentById,
  isSystemStatePropagationComplete,
} from "./system.simulation.propagation";
export {
  SYSTEM_PRE_RUNTIME_VIOLATION_RULES,
  buildSystemPreRuntimeViolationManifest,
  getSystemPreRuntimeViolationById,
  isSystemPreRuntimeViolationRulesComplete,
} from "./system.simulation.violation";
export {
  SYSTEM_FAILURE_SCENARIOS,
  buildSystemFailureScenarioManifest,
  getSystemFailureScenarioById,
  getSystemFailureScenarioByKind,
  isSystemFailureScenarioSetComplete,
} from "./system.simulation.failure";
export {
  assertSystemSimulationCatalogPass,
  buildSystemSimulationCatalog,
} from "./system.simulation.builder";
export {
  V80_SYSTEM_SIMULATION_FREEZE_VERSION,
  V80_SYSTEM_SIMULATION_VERSION,
} from "./system.simulation";
export type {
  SystemFailureScenario,
  SystemFailureScenarioKind,
  SystemPreRuntimeViolationRule,
  SystemSimulationCatalogReport,
  SystemSimulationCatalogSignals,
  SystemSimulationKind,
  SystemSimulationModel,
  SystemStatePropagationSegment,
} from "./system.simulation";

import { buildSystemSimulationCatalog } from "./system.simulation.builder";
import type {
  SystemSimulationCatalogReport,
  SystemSimulationCatalogSignals,
} from "./system.simulation";

export function runSystemSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: SystemSimulationCatalogSignals;
}): SystemSimulationCatalogReport {
  return buildSystemSimulationCatalog(input);
}

export function formatSystemSimulationCatalogSummary(
  report: SystemSimulationCatalogReport,
): string {
  return [
    "V80 System Meta Simulation",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  policy-catalog: ${report.systemPolicyCatalogVersion} (ready=${report.systemPolicyCatalogReady})`,
    `  simulations: ${report.catalog.entryCount}`,
    `  propagation-segments: ${report.propagation.segmentCount}`,
    `  violation-rules: ${report.violations.ruleCount}`,
    `  failure-scenarios: ${report.failures.scenarioCount}`,
  ].join("\n");
}
