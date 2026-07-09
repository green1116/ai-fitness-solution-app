/**
 * V80 P2 — Cross-layer system policy catalog (declarative)
 */
import {
  SYSTEM_GOVERNANCE_CATALOG,
  SYSTEM_ROLE_CATALOG,
  SYSTEM_TOPOLOGY_CATALOG,
} from "./system.inventory";
import { SYSTEM_STACK_DEPENDENCIES } from "./system.dependencies";
import { SYSTEM_INVARIANT_CATALOG } from "./system.invariant.catalog";
import { SYSTEM_META_CONSTRAINT_CATALOG } from "./system.constraint.catalog";
import { SYSTEM_SCOPE_CATALOG } from "./system.scope";
import type {
  SystemPolicyCatalogManifest,
  SystemPolicyEntry,
  SystemPolicyEnforcement,
} from "./system.policy";
import { V80_SYSTEM_POLICY_VERSION } from "./system.policy";

const STACK_LAYERS = ["V76", "V77", "V78", "V79"] as const;

const REQUIRED_KINDS: SystemPolicyEntry["kind"][] = [
  "boundary",
  "stack-freeze",
  "cross-layer",
  "dependency",
  "governance",
  "scope",
  "topology",
  "version",
];

export const SYSTEM_POLICY_CATALOG: SystemPolicyEntry[] = [
  {
    id: "SYS-POL-001",
    kind: "boundary",
    priority: 1,
    layerRefs: [...STACK_LAYERS],
    roleRef: "SYS-ROL-008",
    topologyRef: "SYS-TOP-008",
    governanceRef: "SYS-GOV-008",
    dependencyRef: "SYS-DEP-008",
    scopeRef: "SYS-SCP-008",
    invariantRef: "SYS-INV-006",
    constraintRef: "SYS-CON-001",
    enforcement: "gate",
    passCondition: "declarative-only-no-runtime",
    blockCondition: "runtime-meta-orchestration-detected",
    required: true,
    description: "Boundary — declarative-only across V76–V79 stack, no runtime",
  },
  {
    id: "SYS-POL-002",
    kind: "stack-freeze",
    priority: 2,
    layerRefs: [...STACK_LAYERS],
    roleRef: "SYS-ROL-001",
    topologyRef: "SYS-TOP-001",
    governanceRef: "SYS-GOV-001",
    dependencyRef: "SYS-DEP-001",
    scopeRef: "SYS-SCP-002",
    invariantRef: "SYS-INV-001",
    constraintRef: "SYS-CON-002",
    enforcement: "invariant",
    passCondition: "stack-freeze-intact",
    blockCondition: "layer-freeze-violation",
    required: true,
    description: "Stack freeze — all V76–V79 layers remain frozen",
  },
  {
    id: "SYS-POL-003",
    kind: "cross-layer",
    priority: 3,
    layerRefs: [...STACK_LAYERS],
    roleRef: "SYS-ROL-006",
    topologyRef: "SYS-TOP-006",
    governanceRef: "SYS-GOV-004",
    dependencyRef: "SYS-DEP-006",
    scopeRef: "SYS-SCP-002",
    invariantRef: "SYS-INV-002",
    constraintRef: "SYS-CON-004",
    enforcement: "gate",
    passCondition: "cross-layer-map-documented",
    blockCondition: "cross-layer-gap-detected",
    required: true,
    description: "Cross-layer map — V76–V79 stack fully mapped",
  },
  {
    id: "SYS-POL-004",
    kind: "dependency",
    priority: 4,
    layerRefs: [...STACK_LAYERS],
    roleRef: "SYS-ROL-003",
    topologyRef: "SYS-TOP-003",
    governanceRef: "SYS-GOV-006",
    dependencyRef: "SYS-DEP-005",
    scopeRef: "SYS-SCP-001",
    invariantRef: "SYS-INV-003",
    constraintRef: "SYS-CON-004",
    enforcement: "gate",
    passCondition: "stack-dependency-chain-valid",
    blockCondition: "dependency-violation",
    required: true,
    description: "Dependency — V76→V79 upstream chain honored",
  },
  {
    id: "SYS-POL-005",
    kind: "governance",
    priority: 5,
    layerRefs: [...STACK_LAYERS],
    roleRef: "SYS-ROL-007",
    topologyRef: "SYS-TOP-007",
    governanceRef: "SYS-GOV-007",
    dependencyRef: "SYS-DEP-004",
    scopeRef: "SYS-SCP-002",
    invariantRef: "SYS-INV-005",
    constraintRef: "SYS-CON-003",
    enforcement: "declarative",
    passCondition: "cross-layer-governance-documented",
    blockCondition: "governance-violation",
    required: true,
    description: "Governance — cross-layer rules documented for V76–V79",
  },
  {
    id: "SYS-POL-006",
    kind: "scope",
    priority: 6,
    layerRefs: [...STACK_LAYERS],
    roleRef: "SYS-ROL-005",
    topologyRef: "SYS-TOP-005",
    governanceRef: "SYS-GOV-005",
    dependencyRef: "SYS-DEP-007",
    scopeRef: "SYS-SCP-001",
    invariantRef: "SYS-INV-004",
    constraintRef: "SYS-CON-003",
    enforcement: "declarative",
    passCondition: "global-scope-bounded",
    blockCondition: "scope-violation",
    required: true,
    description: "Scope — global system scope bounds all stack layers",
  },
  {
    id: "SYS-POL-007",
    kind: "topology",
    priority: 7,
    layerRefs: [...STACK_LAYERS],
    roleRef: "SYS-ROL-002",
    topologyRef: "SYS-TOP-002",
    governanceRef: "SYS-GOV-003",
    dependencyRef: "SYS-DEP-003",
    scopeRef: "SYS-SCP-004",
    invariantRef: "SYS-INV-002",
    constraintRef: "SYS-CON-002",
    enforcement: "gate",
    passCondition: "stack-topology-acyclic",
    blockCondition: "topology-cycle-detected",
    required: true,
    description: "Topology — V76–V79 stack pipeline acyclic",
  },
  {
    id: "SYS-POL-008",
    kind: "version",
    priority: 8,
    layerRefs: [...STACK_LAYERS],
    roleRef: "SYS-ROL-004",
    topologyRef: "SYS-TOP-004",
    governanceRef: "SYS-GOV-002",
    dependencyRef: "SYS-DEP-002",
    scopeRef: "SYS-SCP-007",
    invariantRef: "SYS-INV-005",
    constraintRef: "SYS-CON-004",
    enforcement: "audit-only",
    passCondition: "layer-signoff-versions-locked",
    blockCondition: "version-drift-detected",
    required: true,
    description: "Version — V76–V79 signoff versions locked",
  },
];

export function isSystemPolicyCatalogRefsAligned(): boolean {
  const scopeIds = new Set(SYSTEM_SCOPE_CATALOG.map((s) => s.id));
  const roleIds = new Set(SYSTEM_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(SYSTEM_TOPOLOGY_CATALOG.map((t) => t.id));
  const governanceIds = new Set(SYSTEM_GOVERNANCE_CATALOG.map((g) => g.id));
  const dependencyIds = new Set(SYSTEM_STACK_DEPENDENCIES.map((d) => d.id));
  const invariantIds = new Set(SYSTEM_INVARIANT_CATALOG.map((i) => i.id));
  const constraintIds = new Set(SYSTEM_META_CONSTRAINT_CATALOG.map((c) => c.id));
  const kinds = new Set(SYSTEM_POLICY_CATALOG.map((p) => p.kind));

  const allLayers = SYSTEM_POLICY_CATALOG.every(
    (p) => p.layerRefs.length === 4 && STACK_LAYERS.every((l) => p.layerRefs.includes(l)),
  );

  const catalogAligned = SYSTEM_POLICY_CATALOG.every(
    (p) =>
      scopeIds.has(p.scopeRef) &&
      roleIds.has(p.roleRef) &&
      topologyIds.has(p.topologyRef) &&
      governanceIds.has(p.governanceRef) &&
      dependencyIds.has(p.dependencyRef) &&
      invariantIds.has(p.invariantRef) &&
      constraintIds.has(p.constraintRef),
  );

  const invariantsAligned = SYSTEM_INVARIANT_CATALOG.every((i) =>
    SYSTEM_POLICY_CATALOG.some((p) => p.id === i.policyRef),
  );

  const constraintsAligned = SYSTEM_META_CONSTRAINT_CATALOG.every((c) =>
    SYSTEM_POLICY_CATALOG.some((p) => p.id === c.policyRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));
  const prioritiesUnique =
    new Set(SYSTEM_POLICY_CATALOG.map((p) => p.priority)).size === SYSTEM_POLICY_CATALOG.length;

  return (
    catalogAligned &&
    invariantsAligned &&
    constraintsAligned &&
    kindsComplete &&
    prioritiesUnique &&
    allLayers &&
    SYSTEM_POLICY_CATALOG.length === 8
  );
}

export function buildSystemPolicyCatalogManifest(): SystemPolicyCatalogManifest {
  const policies = SYSTEM_POLICY_CATALOG;
  const kinds = new Set(policies.map((p) => p.kind));
  const catalogComplete =
    policies.length === 8 && kinds.size === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V80_SYSTEM_POLICY_VERSION,
    entryCount: policies.length,
    kindCount: kinds.size,
    catalogComplete,
    policies,
    summary: `system-policies count=${policies.length} kinds=${kinds.size} complete=${catalogComplete}`,
  };
}

export function getSystemPolicyById(id: string): SystemPolicyEntry | undefined {
  return SYSTEM_POLICY_CATALOG.find((p) => p.id === id);
}

export function getSystemPoliciesByKind(kind: SystemPolicyEntry["kind"]): SystemPolicyEntry[] {
  return SYSTEM_POLICY_CATALOG.filter((p) => p.kind === kind);
}

export function computeSystemDeclarativePolicyBlock(input: {
  kind: SystemPolicyEntry["kind"];
  enforcement: SystemPolicyEnforcement;
}): boolean {
  return input.kind === "boundary" && input.enforcement === "gate";
}
