/**
 * V80 P3 — Failure scenario set (orphan / desync / bypass / freeze conflict)
 */
import { SYSTEM_INVARIANT_CATALOG } from "./system.invariant.catalog";
import { SYSTEM_POLICY_CATALOG } from "./system.policy.catalog";
import type { SystemFailureScenario, SystemFailureScenarioManifest } from "./system.simulation";
import { V80_SYSTEM_SIMULATION_VERSION } from "./system.simulation";

const REQUIRED_KINDS = ["orphan", "desync", "bypass", "freeze-conflict"] as const;

export const SYSTEM_FAILURE_SCENARIOS: SystemFailureScenario[] = [
  {
    id: "SYS-FAIL-001",
    kind: "orphan",
    policyRef: "SYS-POL-003",
    invariantRef: "SYS-INV-002",
    simulationRef: "SYS-SIM-006",
    trigger: "layer-without-cross-layer-map-entry",
    expectedBlock: "cross-layer-gap-detected",
    required: true,
    description: "Orphan layer — stack layer missing from cross-layer map",
  },
  {
    id: "SYS-FAIL-002",
    kind: "desync",
    policyRef: "SYS-POL-008",
    invariantRef: "SYS-INV-005",
    simulationRef: "SYS-SIM-002",
    trigger: "signoff-version-mismatch-between-layers",
    expectedBlock: "version-drift-detected",
    required: true,
    description: "Desync — V76–V79 signoff versions diverge",
  },
  {
    id: "SYS-FAIL-003",
    kind: "bypass",
    policyRef: "SYS-POL-001",
    invariantRef: "SYS-INV-006",
    simulationRef: "SYS-SIM-003",
    trigger: "runtime-orchestration-bypasses-declarative-boundary",
    expectedBlock: "runtime-meta-orchestration-detected",
    required: true,
    description: "Bypass — runtime engine bypasses declarative-only boundary",
  },
  {
    id: "SYS-FAIL-004",
    kind: "freeze-conflict",
    policyRef: "SYS-POL-002",
    invariantRef: "SYS-INV-001",
    simulationRef: "SYS-SIM-004",
    trigger: "lower-layer-freeze-mutation-attempt",
    expectedBlock: "layer-freeze-violation",
    required: true,
    description: "Freeze conflict — V76–V79 frozen layer mutation attempted",
  },
];

export function isSystemFailureScenarioSetComplete(): boolean {
  const policyIds = new Set(SYSTEM_POLICY_CATALOG.map((p) => p.id));
  const invariantIds = new Set(SYSTEM_INVARIANT_CATALOG.map((i) => i.id));
  const kinds = new Set(SYSTEM_FAILURE_SCENARIOS.map((f) => f.kind));

  return (
    SYSTEM_FAILURE_SCENARIOS.length === 4 &&
    REQUIRED_KINDS.every((k) => kinds.has(k)) &&
    SYSTEM_FAILURE_SCENARIOS.every(
      (f) =>
        policyIds.has(f.policyRef) &&
        invariantIds.has(f.invariantRef) &&
        f.simulationRef.startsWith("SYS-SIM-") &&
        f.trigger.length > 0 &&
        f.expectedBlock.length > 0,
    )
  );
}

export function buildSystemFailureScenarioManifest(): SystemFailureScenarioManifest {
  const scenarios = SYSTEM_FAILURE_SCENARIOS;
  const scenariosComplete = isSystemFailureScenarioSetComplete();

  return {
    version: V80_SYSTEM_SIMULATION_VERSION,
    scenarioCount: scenarios.length,
    scenariosComplete,
    scenarios,
    summary: `system-failures scenarios=${scenarios.length} complete=${scenariosComplete}`,
  };
}

export function getSystemFailureScenarioByKind(
  kind: SystemFailureScenario["kind"],
): SystemFailureScenario | undefined {
  return SYSTEM_FAILURE_SCENARIOS.find((f) => f.kind === kind);
}

export function getSystemFailureScenarioById(id: string): SystemFailureScenario | undefined {
  return SYSTEM_FAILURE_SCENARIOS.find((f) => f.id === id);
}
