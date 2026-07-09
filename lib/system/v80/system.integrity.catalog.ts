/**
 * V80 P4 — System integrity enforcement catalog (declarative)
 */
import {
  SYSTEM_ROLE_CATALOG,
  SYSTEM_TOPOLOGY_CATALOG,
} from "./system.inventory";
import { SYSTEM_INVARIANT_CATALOG } from "./system.invariant.catalog";
import { SYSTEM_POLICY_CATALOG } from "./system.policy.catalog";
import { SYSTEM_SIMULATION_CATALOG } from "./system.simulation.catalog";
import { SYSTEM_CONSISTENCY_CHECKS } from "./system.integrity.consistency";
import { SYSTEM_DRIFT_DETECTORS } from "./system.integrity.drift";
import {
  SYSTEM_GLOBAL_FREEZE_SEMANTICS,
  SYSTEM_RECONCILIATION_RULES,
} from "./system.integrity.reconciliation";
import type {
  SystemIntegrityCatalogManifest,
  SystemIntegrityKind,
  SystemIntegrityRule,
} from "./system.integrity";
import { V80_SYSTEM_INTEGRITY_VERSION } from "./system.integrity";

const STACK_LAYERS = ["V76", "V77", "V78", "V79"] as const;

const REQUIRED_KINDS: SystemIntegrityKind[] = [
  "consistency",
  "drift",
  "reconciliation",
  "freeze",
  "policy",
  "simulation",
];

export const SYSTEM_INTEGRITY_CATALOG: SystemIntegrityRule[] = [
  {
    id: "SYS-INT-001",
    kind: "consistency",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-003",
    invariantRef: "SYS-INV-002",
    simulationRef: "SYS-SIM-001",
    consistencyRef: "SYS-CONS-001",
    driftRef: "SYS-DRF-001",
    reconciliationRef: "SYS-REC-001",
    freezeRef: "SYS-GFZ-001",
    roleRef: "SYS-ROL-006",
    topologyRef: "SYS-TOP-006",
    scopeRef: "SYS-SCP-002",
    rule: "cross-layer-consistency-must-hold",
    passCondition: "consistency-checks-pass",
    blockCondition: "consistency-violation-detected",
    status: "enforced",
    required: true,
    description: "Cross-layer consistency enforcement — V76–V79 stack aligned",
  },
  {
    id: "SYS-INT-002",
    kind: "drift",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-008",
    invariantRef: "SYS-INV-005",
    simulationRef: "SYS-SIM-002",
    consistencyRef: "SYS-CONS-004",
    driftRef: "SYS-DRF-004",
    reconciliationRef: "SYS-REC-002",
    freezeRef: "SYS-GFZ-002",
    roleRef: "SYS-ROL-004",
    topologyRef: "SYS-TOP-004",
    scopeRef: "SYS-SCP-006",
    rule: "stack-drift-must-be-detected",
    passCondition: "no-drift-detected",
    blockCondition: "drift-detected-block",
    status: "enforced",
    required: true,
    description: "Drift detection enforcement — V76–V79 version/freeze drift",
  },
  {
    id: "SYS-INT-003",
    kind: "reconciliation",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-004",
    invariantRef: "SYS-INV-003",
    simulationRef: "SYS-SIM-006",
    consistencyRef: "SYS-CONS-002",
    driftRef: "SYS-DRF-003",
    reconciliationRef: "SYS-REC-003",
    freezeRef: "SYS-GFZ-002",
    roleRef: "SYS-ROL-003",
    topologyRef: "SYS-TOP-003",
    scopeRef: "SYS-SCP-005",
    rule: "declarative-reconciliation-no-mutation",
    passCondition: "reconciliation-documented",
    blockCondition: "mutation-reconciliation-blocked",
    status: "enforced",
    required: true,
    description: "Reconciliation enforcement — declarative restore without mutation",
  },
  {
    id: "SYS-INT-004",
    kind: "freeze",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-002",
    invariantRef: "SYS-INV-001",
    simulationRef: "SYS-SIM-004",
    consistencyRef: "SYS-CONS-001",
    driftRef: "SYS-DRF-002",
    reconciliationRef: "SYS-REC-001",
    freezeRef: "SYS-GFZ-003",
    roleRef: "SYS-ROL-001",
    topologyRef: "SYS-TOP-001",
    scopeRef: "SYS-SCP-002",
    rule: "global-freeze-semantics-enforced",
    passCondition: "stack-freeze-intact",
    blockCondition: "freeze-conflict-blocked",
    status: "enforced",
    required: true,
    description: "Global freeze semantics — V76–V79 stack-wide lock",
  },
  {
    id: "SYS-INT-005",
    kind: "policy",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-001",
    invariantRef: "SYS-INV-006",
    simulationRef: "SYS-SIM-003",
    consistencyRef: "SYS-CONS-003",
    driftRef: "SYS-DRF-001",
    reconciliationRef: "SYS-REC-001",
    freezeRef: "SYS-GFZ-003",
    roleRef: "SYS-ROL-008",
    topologyRef: "SYS-TOP-008",
    scopeRef: "SYS-SCP-008",
    rule: "v80-policy-integrity-enforced",
    passCondition: "policy-constraints-satisfied",
    blockCondition: "policy-violation-blocked",
    status: "enforced",
    required: true,
    description: "Policy integrity — V80 POL+INV constraints enforced",
  },
  {
    id: "SYS-INT-006",
    kind: "simulation",
    layerRefs: [...STACK_LAYERS],
    policyRef: "SYS-POL-005",
    invariantRef: "SYS-INV-004",
    simulationRef: "SYS-SIM-005",
    consistencyRef: "SYS-CONS-003",
    driftRef: "SYS-DRF-004",
    reconciliationRef: "SYS-REC-002",
    freezeRef: "SYS-GFZ-001",
    roleRef: "SYS-ROL-007",
    topologyRef: "SYS-TOP-007",
    scopeRef: "SYS-SCP-001",
    rule: "v80-simulation-integrity-enforced",
    passCondition: "simulation-outputs-consumed",
    blockCondition: "simulation-gap-blocked",
    status: "enforced",
    required: true,
    description: "Simulation integrity — V80 SIM outputs consumed for enforcement",
  },
];

export function isSystemIntegrityCatalogRefsAligned(): boolean {
  const policyIds = new Set(SYSTEM_POLICY_CATALOG.map((p) => p.id));
  const invariantIds = new Set(SYSTEM_INVARIANT_CATALOG.map((i) => i.id));
  const simulationIds = new Set(SYSTEM_SIMULATION_CATALOG.map((s) => s.id));
  const consistencyIds = new Set(SYSTEM_CONSISTENCY_CHECKS.map((c) => c.id));
  const driftIds = new Set(SYSTEM_DRIFT_DETECTORS.map((d) => d.id));
  const reconciliationIds = new Set(SYSTEM_RECONCILIATION_RULES.map((r) => r.id));
  const freezeIds = new Set(SYSTEM_GLOBAL_FREEZE_SEMANTICS.map((f) => f.id));
  const roleIds = new Set(SYSTEM_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(SYSTEM_TOPOLOGY_CATALOG.map((t) => t.id));
  const integrityIds = new Set(SYSTEM_INTEGRITY_CATALOG.map((r) => r.id));
  const kinds = new Set(SYSTEM_INTEGRITY_CATALOG.map((r) => r.kind));

  const allLayers = SYSTEM_INTEGRITY_CATALOG.every(
    (r) => r.layerRefs.length === 4 && STACK_LAYERS.every((l) => r.layerRefs.includes(l)),
  );

  const rulesAligned = SYSTEM_INTEGRITY_CATALOG.every(
    (r) =>
      policyIds.has(r.policyRef) &&
      invariantIds.has(r.invariantRef) &&
      simulationIds.has(r.simulationRef) &&
      consistencyIds.has(r.consistencyRef) &&
      driftIds.has(r.driftRef) &&
      reconciliationIds.has(r.reconciliationRef) &&
      freezeIds.has(r.freezeRef) &&
      roleIds.has(r.roleRef) &&
      topologyIds.has(r.topologyRef) &&
      r.rule.length > 0 &&
      r.passCondition.length > 0,
  );

  const consistencyAligned = SYSTEM_CONSISTENCY_CHECKS.every((c) =>
    integrityIds.has(c.integrityRef),
  );
  const driftAligned = SYSTEM_DRIFT_DETECTORS.every((d) => integrityIds.has(d.integrityRef));
  const reconciliationAligned = SYSTEM_RECONCILIATION_RULES.every((r) =>
    integrityIds.has(r.integrityRef),
  );
  const freezeAligned = SYSTEM_GLOBAL_FREEZE_SEMANTICS.every((f) =>
    integrityIds.has(f.integrityRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    rulesAligned &&
    consistencyAligned &&
    driftAligned &&
    reconciliationAligned &&
    freezeAligned &&
    kindsComplete &&
    allLayers &&
    SYSTEM_INTEGRITY_CATALOG.length === 6
  );
}

export function buildSystemIntegrityCatalogManifest(): SystemIntegrityCatalogManifest {
  const rules = SYSTEM_INTEGRITY_CATALOG;
  const kinds = new Set(rules.map((r) => r.kind));
  const catalogComplete =
    rules.length === 6 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V80_SYSTEM_INTEGRITY_VERSION,
    entryCount: rules.length,
    kindCount: kinds.size,
    catalogComplete,
    rules,
    summary: `system-integrity count=${rules.length} kinds=${kinds.size} complete=${catalogComplete}`,
  };
}

export function getSystemIntegrityRuleById(id: string): SystemIntegrityRule | undefined {
  return SYSTEM_INTEGRITY_CATALOG.find((r) => r.id === id);
}

export function getSystemIntegrityRulesByKind(kind: SystemIntegrityKind): SystemIntegrityRule[] {
  return SYSTEM_INTEGRITY_CATALOG.filter((r) => r.kind === kind);
}

export function computeSystemDeclarativeIntegrityEnforced(input: {
  kind: SystemIntegrityKind;
  status: SystemIntegrityRule["status"];
}): boolean {
  return input.kind === "freeze" && input.status === "enforced";
}
