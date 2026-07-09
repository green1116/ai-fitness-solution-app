/**
 * V80 P3 — System meta simulation builder (read-only)
 */
import { buildSystemPolicyCatalog } from "./system.policy.builder";
import { V80_SYSTEM_POLICY_VERSION } from "./system.policy";
import {
  buildSystemSimulationCatalogManifest,
  isSystemSimulationCatalogRefsAligned,
} from "./system.simulation.catalog";
import { buildSystemFailureScenarioManifest } from "./system.simulation.failure";
import { buildSystemStatePropagationManifest } from "./system.simulation.propagation";
import { buildSystemPreRuntimeViolationManifest } from "./system.simulation.violation";
import type {
  SystemSimulationCatalogReport,
  SystemSimulationCatalogSignals,
} from "./system.simulation";
import {
  V80_SYSTEM_SIMULATION_FREEZE_VERSION,
  V80_SYSTEM_SIMULATION_VERSION,
} from "./system.simulation";

const DEFAULT_SIGNALS: SystemSimulationCatalogSignals = {
  systemPolicyCatalogReady: true,
  catalogComplete: true,
  propagationComplete: true,
  violationsComplete: true,
  failuresComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildSystemSimulationCatalog(input?: {
  deploymentId?: string;
  signals?: SystemSimulationCatalogSignals;
}): SystemSimulationCatalogReport {
  const deploymentId = input?.deploymentId ?? "v80-system-meta-simulation-default";

  const systemPolicyCatalog = buildSystemPolicyCatalog({ deploymentId });
  const catalog = buildSystemSimulationCatalogManifest();
  const propagation = buildSystemStatePropagationManifest();
  const violations = buildSystemPreRuntimeViolationManifest();
  const failures = buildSystemFailureScenarioManifest();
  const refsAligned = isSystemSimulationCatalogRefsAligned();

  const signals: SystemSimulationCatalogSignals = {
    ...DEFAULT_SIGNALS,
    systemPolicyCatalogReady: systemPolicyCatalog.catalogReady,
    catalogComplete: catalog.catalogComplete,
    propagationComplete: propagation.propagationComplete,
    violationsComplete: violations.rulesComplete,
    failuresComplete: failures.scenariosComplete,
    refsAligned,
    freezeVersionDeclared: V80_SYSTEM_SIMULATION_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    systemPolicyCatalog.catalogReady &&
    catalog.catalogComplete &&
    propagation.propagationComplete &&
    violations.rulesComplete &&
    failures.scenariosComplete &&
    refsAligned &&
    signals.systemPolicyCatalogReady !== false &&
    signals.refsAligned !== false;

  return {
    version: V80_SYSTEM_SIMULATION_VERSION,
    freezeVersion: V80_SYSTEM_SIMULATION_FREEZE_VERSION,
    reportId: `system-meta-simulation-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    systemPolicyCatalogVersion: V80_SYSTEM_POLICY_VERSION,
    systemPolicyCatalogReady: systemPolicyCatalog.catalogReady,
    catalog,
    propagation,
    violations,
    failures,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `system-meta-simulation ready=${catalogReady}`,
      `simulations=${catalog.entryCount}`,
      `propagation=${propagation.segmentCount}`,
      `violations=${violations.ruleCount}`,
      `failures=${failures.scenarioCount}`,
      `policyCatalog=${systemPolicyCatalog.catalogReady}`,
    ].join(" "),
  };
}

export function assertSystemSimulationCatalogPass(
  report: SystemSimulationCatalogReport,
): asserts report is SystemSimulationCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V80 system meta simulation not ready: ${report.summary}`);
  }
}
