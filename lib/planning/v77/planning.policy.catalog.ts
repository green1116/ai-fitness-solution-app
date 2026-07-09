/**
 * V77 P2 — Planning policy catalog (declarative)
 */
import { PLANNING_UPSTREAM_DEPENDENCIES } from "./planning.dependencies";
import {
  PLANNING_GOVERNANCE_CATALOG,
  PLANNING_ROLE_CATALOG,
  PLANNING_TOPOLOGY_CATALOG,
} from "./planning.inventory";
import { PLANNING_SCOPE_CATALOG } from "./planning.scope";
import type {
  PlanningPolicyCatalogEntry,
  PlanningPolicyCatalogManifest,
  PlanningPolicyEnforcement,
  PlanningPolicyGate,
  PlanningPolicyGateManifest,
} from "./planning.policy";
import { V77_PLANNING_POLICY_VERSION } from "./planning.policy";

const REQUIRED_KINDS: PlanningPolicyCatalogEntry["kind"][] = [
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
  "compliance",
  "version",
];

export const PLANNING_POLICY_CATALOG_ENTRIES: PlanningPolicyCatalogEntry[] = [
  {
    id: "PLN-PLC-001",
    kind: "boundary",
    priority: 1,
    roleRef: "PLN-ROL-008",
    topologyRef: "PLN-TOP-008",
    governanceRef: "PLN-GOV-008",
    dependencyRef: "PLN-DEP-008",
    scopeRef: "PLN-SCP-008",
    enforcement: "gate",
    passCondition: "declarative-only-no-runtime",
    blockCondition: "runtime-planning-detected",
    required: true,
    description: "Boundary policy — declarative-only with no runtime planning execution",
  },
  {
    id: "PLN-PLC-002",
    kind: "role",
    priority: 2,
    roleRef: "PLN-ROL-001",
    topologyRef: "PLN-TOP-001",
    governanceRef: "PLN-GOV-001",
    dependencyRef: "PLN-DEP-001",
    scopeRef: "PLN-SCP-001",
    enforcement: "declarative",
    passCondition: "planning-role-defined",
    blockCondition: "role-undefined",
    required: true,
    description: "Role policy — primary planner role from collaboration baseline",
  },
  {
    id: "PLN-PLC-003",
    kind: "topology",
    priority: 3,
    roleRef: "PLN-ROL-002",
    topologyRef: "PLN-TOP-002",
    governanceRef: "PLN-GOV-002",
    dependencyRef: "PLN-DEP-003",
    scopeRef: "PLN-SCP-003",
    enforcement: "gate",
    passCondition: "planning-topology-acyclic",
    blockCondition: "topology-cycle-detected",
    required: true,
    description: "Topology policy — enforce acyclic planning graph",
  },
  {
    id: "PLN-PLC-004",
    kind: "scope",
    priority: 4,
    roleRef: "PLN-ROL-005",
    topologyRef: "PLN-TOP-005",
    governanceRef: "PLN-GOV-005",
    dependencyRef: "PLN-DEP-006",
    scopeRef: "PLN-SCP-006",
    enforcement: "declarative",
    passCondition: "planning-scope-bounded",
    blockCondition: "scope-violation",
    required: true,
    description: "Scope policy — bound planning within declared scopes",
  },
  {
    id: "PLN-PLC-005",
    kind: "dependency",
    priority: 5,
    roleRef: "PLN-ROL-004",
    topologyRef: "PLN-TOP-004",
    governanceRef: "PLN-GOV-006",
    dependencyRef: "PLN-DEP-005",
    scopeRef: "PLN-SCP-007",
    enforcement: "gate",
    passCondition: "upstream-dependency-intact",
    blockCondition: "dependency-violation",
    required: true,
    description: "Dependency policy — honor upstream collaboration locks",
  },
  {
    id: "PLN-PLC-006",
    kind: "governance",
    priority: 6,
    roleRef: "PLN-ROL-007",
    topologyRef: "PLN-TOP-007",
    governanceRef: "PLN-GOV-007",
    dependencyRef: "PLN-DEP-004",
    scopeRef: "PLN-SCP-006",
    enforcement: "gate",
    passCondition: "governance-rules-documented",
    blockCondition: "governance-violation",
    required: true,
    description: "Governance policy — require planning governance rules documented",
  },
  {
    id: "PLN-PLC-007",
    kind: "compliance",
    priority: 7,
    roleRef: "PLN-ROL-006",
    topologyRef: "PLN-TOP-006",
    governanceRef: "PLN-GOV-003",
    dependencyRef: "PLN-DEP-002",
    scopeRef: "PLN-SCP-008",
    enforcement: "gate",
    passCondition: "inventory-catalog-complete",
    blockCondition: "compliance-violation",
    required: true,
    description: "Compliance policy — require planning inventory complete before sign-off",
  },
  {
    id: "PLN-PLC-008",
    kind: "version",
    priority: 8,
    roleRef: "PLN-ROL-003",
    topologyRef: "PLN-TOP-003",
    governanceRef: "PLN-GOV-006",
    dependencyRef: "PLN-DEP-007",
    scopeRef: "PLN-SCP-005",
    enforcement: "audit-only",
    passCondition: "version-lock-consistent",
    blockCondition: "version-drift-detected",
    required: true,
    description: "Version policy — planning version lock must match upstream",
  },
];

export const PLANNING_POLICY_GATE_CATALOG: PlanningPolicyGate[] = [
  {
    id: "PLN-PLG-001",
    policyRef: "PLN-PLC-001",
    gateKind: "boundary",
    verifyScript: "declarative:no-runtime-planning",
    required: true,
    description: "Boundary gate — no runtime planning execution",
  },
  {
    id: "PLN-PLG-002",
    policyRef: "PLN-PLC-002",
    gateKind: "role",
    verifyScript: "declarative:planning-role-defined",
    required: true,
    description: "Role policy gate",
  },
  {
    id: "PLN-PLG-003",
    policyRef: "PLN-PLC-003",
    gateKind: "topology",
    verifyScript: "declarative:planning-topology-acyclic",
    required: true,
    description: "Topology acyclic gate",
  },
  {
    id: "PLN-PLG-004",
    policyRef: "PLN-PLC-004",
    gateKind: "scope",
    verifyScript: "declarative:planning-scope-bounded",
    required: true,
    description: "Scope boundary gate",
  },
  {
    id: "PLN-PLG-005",
    policyRef: "PLN-PLC-005",
    gateKind: "dependency",
    verifyScript: "declarative:upstream-dependency-intact",
    required: true,
    description: "Dependency upstream gate",
  },
  {
    id: "PLN-PLG-006",
    policyRef: "PLN-PLC-006",
    gateKind: "governance",
    verifyScript: "declarative:planning-governance",
    required: true,
    description: "Governance rules gate",
  },
  {
    id: "PLN-PLG-007",
    policyRef: "PLN-PLC-007",
    gateKind: "compliance",
    verifyScript: "npx tsx scripts/verify-v77-p1-planning-inventory.ts",
    required: true,
    description: "Compliance inventory gate",
  },
  {
    id: "PLN-PLG-008",
    policyRef: "PLN-PLC-008",
    gateKind: "version",
    verifyScript: "declarative:version-lock-consistent",
    required: true,
    description: "Version lock gate",
  },
];

export function isPlanningPolicyCatalogRefsAligned(): boolean {
  const scopeIds = new Set(PLANNING_SCOPE_CATALOG.map((s) => s.id));
  const roleIds = new Set(PLANNING_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(PLANNING_TOPOLOGY_CATALOG.map((t) => t.id));
  const governanceIds = new Set(PLANNING_GOVERNANCE_CATALOG.map((g) => g.id));
  const dependencyIds = new Set(PLANNING_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const catalogIds = new Set(PLANNING_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const kinds = new Set(PLANNING_POLICY_CATALOG_ENTRIES.map((p) => p.kind));

  const catalogAligned = PLANNING_POLICY_CATALOG_ENTRIES.every(
    (p) =>
      scopeIds.has(p.scopeRef) &&
      roleIds.has(p.roleRef) &&
      topologyIds.has(p.topologyRef) &&
      governanceIds.has(p.governanceRef) &&
      dependencyIds.has(p.dependencyRef),
  );

  const gatesAligned = PLANNING_POLICY_GATE_CATALOG.every((g) => catalogIds.has(g.policyRef));

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  const prioritiesUnique =
    new Set(PLANNING_POLICY_CATALOG_ENTRIES.map((p) => p.priority)).size ===
    PLANNING_POLICY_CATALOG_ENTRIES.length;

  return (
    catalogAligned &&
    gatesAligned &&
    kindsComplete &&
    prioritiesUnique &&
    PLANNING_POLICY_CATALOG_ENTRIES.length === 8
  );
}

export function buildPlanningPolicyCatalogManifest(): PlanningPolicyCatalogManifest {
  const policies = PLANNING_POLICY_CATALOG_ENTRIES;
  const kinds = new Set(policies.map((p) => p.kind));
  const catalogComplete =
    policies.length === 8 && kinds.size === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V77_PLANNING_POLICY_VERSION,
    entryCount: policies.length,
    kindCount: kinds.size,
    catalogComplete,
    policies,
    summary: [
      `planning-policy-catalog count=${policies.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPlanningPolicyGateManifest(): PlanningPolicyGateManifest {
  const gates = PLANNING_POLICY_GATE_CATALOG;
  const catalogComplete = gates.length >= 8;

  return {
    version: V77_PLANNING_POLICY_VERSION,
    gateCount: gates.length,
    catalogComplete,
    gates,
    summary: [
      `planning-policy-gates count=${gates.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getPlanningPolicyCatalogEntryById(
  id: string,
): PlanningPolicyCatalogEntry | undefined {
  return PLANNING_POLICY_CATALOG_ENTRIES.find((p) => p.id === id);
}

export function getPlanningPolicyCatalogEntriesByKind(
  kind: PlanningPolicyCatalogEntry["kind"],
): PlanningPolicyCatalogEntry[] {
  return PLANNING_POLICY_CATALOG_ENTRIES.filter((p) => p.kind === kind);
}

export function getPlanningPolicyGateByPolicyRef(
  policyRef: string,
): PlanningPolicyGate | undefined {
  return PLANNING_POLICY_GATE_CATALOG.find((g) => g.policyRef === policyRef);
}

export function computePlanningDeclarativePolicyBlock(input: {
  kind: PlanningPolicyCatalogEntry["kind"];
  enforcement: PlanningPolicyEnforcement;
}): boolean {
  return input.kind === "boundary" && input.enforcement === "gate";
}
