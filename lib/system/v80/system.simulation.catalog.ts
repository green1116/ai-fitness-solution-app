/**
 * V80 P3 — System meta simulation catalog (declarative)
 */
import {
  SYSTEM_ROLE_CATALOG,
  SYSTEM_TOPOLOGY_CATALOG,
} from "./system.inventory";
import { SYSTEM_STACK_DEPENDENCIES } from "./system.dependencies";
import { SYSTEM_INVARIANT_CATALOG } from "./system.invariant.catalog";
import { SYSTEM_POLICY_CATALOG } from "./system.policy.catalog";
import { SYSTEM_FAILURE_SCENARIOS } from "./system.simulation.failure";
import { SYSTEM_STATE_PROPAGATION_SEGMENTS } from "./system.simulation.propagation";
import { SYSTEM_PRE_RUNTIME_VIOLATION_RULES } from "./system.simulation.violation";
import type {
  SystemSimulationCatalogManifest,
  SystemSimulationKind,
  SystemSimulationModel,
} from "./system.simulation";
import { V80_SYSTEM_SIMULATION_VERSION } from "./system.simulation";

const STACK_LAYERS = ["V76", "V77", "V78", "V79"] as const;

const REQUIRED_KINDS: SystemSimulationKind[] = [
  "flow",
  "propagation",
  "policy",
  "invariant",
  "violation",
  "failure",
];

export const SYSTEM_SIMULATION_CATALOG: SystemSimulationModel[] = [
  {
    id: "SYS-SIM-001",
    kind: "flow",
    scenario: "cross-layer-stack-flow-dry-run",
    purpose: "Declarative dry-run of V76→V79 stack flow under V80 policies",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-003",
    invariantRef: "SYS-INV-002",
    roleRef: "SYS-ROL-006",
    topologyRef: "SYS-TOP-006",
    dependencyRef: "SYS-DEP-006",
    scopeRef: "SYS-SCP-002",
    branches: ["flow-intact", "gap-detected"],
    assumptions: ["cross-layer-map-documented", "no-runtime-engine"],
    expectedResult: "cross-layer-map-documented",
    priority: "high",
    propagationRef: "SYS-PRP-004",
    violationRef: "SYS-VIO-006",
    failureRef: "SYS-FAIL-001",
    required: true,
    description: "Cross-layer flow simulation — V76→V79 stack dry-run",
  },
  {
    id: "SYS-SIM-002",
    kind: "propagation",
    scenario: "state-propagation-chain-preview",
    purpose: "Preview V76→V79 state propagation without runtime execution",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-007",
    invariantRef: "SYS-INV-005",
    roleRef: "SYS-ROL-002",
    topologyRef: "SYS-TOP-002",
    dependencyRef: "SYS-DEP-003",
    scopeRef: "SYS-SCP-004",
    branches: ["propagate-ok", "desync-block"],
    assumptions: ["layer-signoff-versions-locked", "propagation-segments=4", "declarative-only"],
    expectedResult: "v76-v79-stack-state-aligned",
    priority: "critical",
    propagationRef: "SYS-PRP-001",
    violationRef: "SYS-VIO-005",
    failureRef: "SYS-FAIL-002",
    required: true,
    description: "State propagation simulation — V76→V79 chain preview",
  },
  {
    id: "SYS-SIM-003",
    kind: "policy",
    scenario: "v80-policy-constraint-preview",
    purpose: "Simulate V80 policy constraints over read-only V76–V79 stack",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-001",
    invariantRef: "SYS-INV-006",
    roleRef: "SYS-ROL-008",
    topologyRef: "SYS-TOP-008",
    dependencyRef: "SYS-DEP-008",
    scopeRef: "SYS-SCP-008",
    branches: ["policy-pass", "bypass-block"],
    assumptions: ["declarative-only-no-runtime", "v80-pol-constraints-loaded"],
    expectedResult: "declarative-only-no-runtime",
    priority: "critical",
    propagationRef: "SYS-PRP-004",
    violationRef: "SYS-VIO-001",
    failureRef: "SYS-FAIL-003",
    required: true,
    description: "Policy constraint simulation — V80 POL+INV as input",
  },
  {
    id: "SYS-SIM-004",
    kind: "invariant",
    scenario: "stack-invariant-dry-run",
    purpose: "Dry-run SYS-INV invariants across V76–V79 without side effects",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-002",
    invariantRef: "SYS-INV-001",
    roleRef: "SYS-ROL-001",
    topologyRef: "SYS-TOP-001",
    dependencyRef: "SYS-DEP-001",
    scopeRef: "SYS-SCP-002",
    branches: ["invariants-hold", "freeze-conflict"],
    assumptions: ["stack-freeze-intact", "no-layer-mutation", "declarative-only"],
    expectedResult: "stack-freeze-intact",
    priority: "high",
    propagationRef: "SYS-PRP-002",
    violationRef: "SYS-VIO-002",
    failureRef: "SYS-FAIL-004",
    required: true,
    description: "Invariant dry-run — freeze integrity across stack",
  },
  {
    id: "SYS-SIM-005",
    kind: "violation",
    scenario: "pre-runtime-violation-scan",
    purpose: "Pre-runtime policy violation detection dry-run before execution",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-006",
    invariantRef: "SYS-INV-004",
    roleRef: "SYS-ROL-007",
    topologyRef: "SYS-TOP-007",
    dependencyRef: "SYS-DEP-007",
    scopeRef: "SYS-SCP-001",
    branches: ["clean", "violation-detected"],
    assumptions: ["global-scope-bounded", "violation-rules=6", "declarative-only"],
    expectedResult: "global-scope-bounded",
    priority: "critical",
    propagationRef: "SYS-PRP-003",
    violationRef: "SYS-VIO-004",
    failureRef: "SYS-FAIL-003",
    required: true,
    description: "Pre-runtime violation scan — policy breach detection rules",
  },
  {
    id: "SYS-SIM-006",
    kind: "failure",
    scenario: "failure-scenario-bundle-preview",
    purpose: "Preview orphan/desync/bypass/freeze-conflict failure paths",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-008",
    invariantRef: "SYS-INV-003",
    roleRef: "SYS-ROL-004",
    topologyRef: "SYS-TOP-004",
    dependencyRef: "SYS-DEP-007",
    scopeRef: "SYS-SCP-006",
    branches: ["orphan", "desync", "bypass", "freeze-conflict"],
    assumptions: ["failure-scenarios=4", "declarative-only=true"],
    expectedResult: "all-failure-scenarios-documented",
    priority: "critical",
    propagationRef: "SYS-PRP-004",
    violationRef: "SYS-VIO-003",
    failureRef: "SYS-FAIL-001",
    required: true,
    description: "Failure scenario bundle — orphan/desync/bypass/freeze conflict",
  },
];

export function isSystemSimulationCatalogRefsAligned(): boolean {
  const policyIds = new Set(SYSTEM_POLICY_CATALOG.map((p) => p.id));
  const invariantIds = new Set(SYSTEM_INVARIANT_CATALOG.map((i) => i.id));
  const roleIds = new Set(SYSTEM_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(SYSTEM_TOPOLOGY_CATALOG.map((t) => t.id));
  const depIds = new Set(SYSTEM_STACK_DEPENDENCIES.map((d) => d.id));
  const propagationIds = new Set(SYSTEM_STATE_PROPAGATION_SEGMENTS.map((p) => p.id));
  const violationIds = new Set(SYSTEM_PRE_RUNTIME_VIOLATION_RULES.map((v) => v.id));
  const failureIds = new Set(SYSTEM_FAILURE_SCENARIOS.map((f) => f.id));
  const simulationIds = new Set(SYSTEM_SIMULATION_CATALOG.map((s) => s.id));
  const kinds = new Set(SYSTEM_SIMULATION_CATALOG.map((s) => s.kind));

  const allLayers = SYSTEM_SIMULATION_CATALOG.every(
    (s) => s.layerRefs.length === 4 && STACK_LAYERS.every((l) => s.layerRefs.includes(l)),
  );

  const simulationsAligned = SYSTEM_SIMULATION_CATALOG.every(
    (s) =>
      policyIds.has(s.policyRef) &&
      invariantIds.has(s.invariantRef) &&
      roleIds.has(s.roleRef) &&
      topologyIds.has(s.topologyRef) &&
      depIds.has(s.dependencyRef) &&
      propagationIds.has(s.propagationRef) &&
      violationIds.has(s.violationRef) &&
      failureIds.has(s.failureRef) &&
      s.branches.length >= 1 &&
      s.assumptions.length >= 1 &&
      s.scenario.length > 0 &&
      s.expectedResult.length > 0,
  );

  const violationsAligned = SYSTEM_PRE_RUNTIME_VIOLATION_RULES.every((v) =>
    simulationIds.has(v.simulationRef),
  );

  const failuresAligned = SYSTEM_FAILURE_SCENARIOS.every((f) =>
    simulationIds.has(f.simulationRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    simulationsAligned &&
    violationsAligned &&
    failuresAligned &&
    kindsComplete &&
    allLayers &&
    SYSTEM_SIMULATION_CATALOG.length === 6
  );
}

export function buildSystemSimulationCatalogManifest(): SystemSimulationCatalogManifest {
  const simulations = SYSTEM_SIMULATION_CATALOG;
  const kinds = new Set(simulations.map((s) => s.kind));
  const catalogComplete =
    simulations.length === 6 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V80_SYSTEM_SIMULATION_VERSION,
    entryCount: simulations.length,
    kindCount: kinds.size,
    catalogComplete,
    simulations,
    summary: `system-simulations count=${simulations.length} kinds=${kinds.size} complete=${catalogComplete}`,
  };
}

export function getSystemSimulationById(id: string): SystemSimulationModel | undefined {
  return SYSTEM_SIMULATION_CATALOG.find((s) => s.id === id);
}

export function getSystemSimulationsByKind(kind: SystemSimulationKind): SystemSimulationModel[] {
  return SYSTEM_SIMULATION_CATALOG.filter((s) => s.kind === kind);
}

export function computeSystemDeclarativeSimulationDeclared(input: {
  kind: SystemSimulationKind;
  expectedResult: string;
}): boolean {
  return input.kind === "flow" && input.expectedResult.length > 0;
}
