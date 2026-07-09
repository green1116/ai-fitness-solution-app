/**
 * V78 P2 — Execution policy catalog (declarative)
 */
import { EXECUTION_UPSTREAM_DEPENDENCIES } from "./execution.dependencies";
import {
  EXECUTION_GOVERNANCE_CATALOG,
  EXECUTION_ROLE_CATALOG,
  EXECUTION_TOPOLOGY_CATALOG,
} from "./execution.inventory";
import { EXECUTION_SCOPE_CATALOG } from "./execution.scope";
import type {
  ExecutionPolicyCatalogEntry,
  ExecutionPolicyCatalogManifest,
  ExecutionPolicyEnforcement,
  ExecutionPolicyGate,
  ExecutionPolicyGateManifest,
} from "./execution.policy";
import { V78_EXECUTION_POLICY_VERSION } from "./execution.policy";

const REQUIRED_KINDS: ExecutionPolicyCatalogEntry["kind"][] = [
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
  "compliance",
  "version",
];

export const EXECUTION_POLICY_CATALOG_ENTRIES: ExecutionPolicyCatalogEntry[] = [
  {
    id: "EXE-PLC-001",
    kind: "boundary",
    priority: 1,
    roleRef: "EXE-ROL-008",
    topologyRef: "EXE-TOP-008",
    governanceRef: "EXE-GOV-008",
    dependencyRef: "EXE-DEP-008",
    scopeRef: "EXE-SCP-008",
    enforcement: "gate",
    passCondition: "declarative-only-no-runtime",
    blockCondition: "runtime-execution-detected",
    required: true,
    description: "Boundary policy — declarative-only with no runtime execution",
  },
  {
    id: "EXE-PLC-002",
    kind: "role",
    priority: 2,
    roleRef: "EXE-ROL-001",
    topologyRef: "EXE-TOP-001",
    governanceRef: "EXE-GOV-001",
    dependencyRef: "EXE-DEP-001",
    scopeRef: "EXE-SCP-001",
    enforcement: "declarative",
    passCondition: "execution-role-defined",
    blockCondition: "role-undefined",
    required: true,
    description: "Role policy — primary executor role from planning baseline",
  },
  {
    id: "EXE-PLC-003",
    kind: "topology",
    priority: 3,
    roleRef: "EXE-ROL-002",
    topologyRef: "EXE-TOP-002",
    governanceRef: "EXE-GOV-002",
    dependencyRef: "EXE-DEP-003",
    scopeRef: "EXE-SCP-003",
    enforcement: "gate",
    passCondition: "execution-topology-acyclic",
    blockCondition: "topology-cycle-detected",
    required: true,
    description: "Topology policy — enforce acyclic execution graph",
  },
  {
    id: "EXE-PLC-004",
    kind: "scope",
    priority: 4,
    roleRef: "EXE-ROL-003",
    topologyRef: "EXE-TOP-003",
    governanceRef: "EXE-GOV-005",
    dependencyRef: "EXE-DEP-006",
    scopeRef: "EXE-SCP-006",
    enforcement: "declarative",
    passCondition: "execution-scope-bounded",
    blockCondition: "scope-violation",
    required: true,
    description: "Scope policy — bound execution within declared scopes",
  },
  {
    id: "EXE-PLC-005",
    kind: "dependency",
    priority: 5,
    roleRef: "EXE-ROL-004",
    topologyRef: "EXE-TOP-004",
    governanceRef: "EXE-GOV-004",
    dependencyRef: "EXE-DEP-005",
    scopeRef: "EXE-SCP-007",
    enforcement: "gate",
    passCondition: "upstream-dependency-intact",
    blockCondition: "dependency-violation",
    required: true,
    description: "Dependency policy — honor upstream planning locks",
  },
  {
    id: "EXE-PLC-006",
    kind: "governance",
    priority: 6,
    roleRef: "EXE-ROL-007",
    topologyRef: "EXE-TOP-007",
    governanceRef: "EXE-GOV-007",
    dependencyRef: "EXE-DEP-004",
    scopeRef: "EXE-SCP-006",
    enforcement: "gate",
    passCondition: "governance-rules-documented",
    blockCondition: "governance-violation",
    required: true,
    description: "Governance policy — require execution governance rules documented",
  },
  {
    id: "EXE-PLC-007",
    kind: "compliance",
    priority: 7,
    roleRef: "EXE-ROL-006",
    topologyRef: "EXE-TOP-006",
    governanceRef: "EXE-GOV-003",
    dependencyRef: "EXE-DEP-002",
    scopeRef: "EXE-SCP-008",
    enforcement: "gate",
    passCondition: "inventory-catalog-complete",
    blockCondition: "compliance-violation",
    required: true,
    description: "Compliance policy — require execution inventory complete before sign-off",
  },
  {
    id: "EXE-PLC-008",
    kind: "version",
    priority: 8,
    roleRef: "EXE-ROL-005",
    topologyRef: "EXE-TOP-005",
    governanceRef: "EXE-GOV-006",
    dependencyRef: "EXE-DEP-007",
    scopeRef: "EXE-SCP-005",
    enforcement: "audit-only",
    passCondition: "version-lock-consistent",
    blockCondition: "version-drift-detected",
    required: true,
    description: "Version policy — execution version lock must match upstream",
  },
];

export const EXECUTION_POLICY_GATE_CATALOG: ExecutionPolicyGate[] = [
  {
    id: "EXE-PLG-001",
    policyRef: "EXE-PLC-001",
    gateKind: "boundary",
    verifyScript: "declarative:no-runtime-execution",
    required: true,
    description: "Boundary gate — no runtime execution",
  },
  {
    id: "EXE-PLG-002",
    policyRef: "EXE-PLC-002",
    gateKind: "role",
    verifyScript: "declarative:execution-role-defined",
    required: true,
    description: "Role policy gate",
  },
  {
    id: "EXE-PLG-003",
    policyRef: "EXE-PLC-003",
    gateKind: "topology",
    verifyScript: "declarative:execution-topology-acyclic",
    required: true,
    description: "Topology acyclic gate",
  },
  {
    id: "EXE-PLG-004",
    policyRef: "EXE-PLC-004",
    gateKind: "scope",
    verifyScript: "declarative:execution-scope-bounded",
    required: true,
    description: "Scope boundary gate",
  },
  {
    id: "EXE-PLG-005",
    policyRef: "EXE-PLC-005",
    gateKind: "dependency",
    verifyScript: "declarative:upstream-dependency-intact",
    required: true,
    description: "Dependency upstream gate",
  },
  {
    id: "EXE-PLG-006",
    policyRef: "EXE-PLC-006",
    gateKind: "governance",
    verifyScript: "declarative:execution-governance",
    required: true,
    description: "Governance rules gate",
  },
  {
    id: "EXE-PLG-007",
    policyRef: "EXE-PLC-007",
    gateKind: "compliance",
    verifyScript: "npx tsx scripts/verify-v78-p1-execution-inventory.ts",
    required: true,
    description: "Compliance inventory gate",
  },
  {
    id: "EXE-PLG-008",
    policyRef: "EXE-PLC-008",
    gateKind: "version",
    verifyScript: "declarative:version-lock-consistent",
    required: true,
    description: "Version lock gate",
  },
];

export function isExecutionPolicyCatalogRefsAligned(): boolean {
  const scopeIds = new Set(EXECUTION_SCOPE_CATALOG.map((s) => s.id));
  const roleIds = new Set(EXECUTION_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(EXECUTION_TOPOLOGY_CATALOG.map((t) => t.id));
  const governanceIds = new Set(EXECUTION_GOVERNANCE_CATALOG.map((g) => g.id));
  const dependencyIds = new Set(EXECUTION_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const catalogIds = new Set(EXECUTION_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const kinds = new Set(EXECUTION_POLICY_CATALOG_ENTRIES.map((p) => p.kind));

  const catalogAligned = EXECUTION_POLICY_CATALOG_ENTRIES.every(
    (p) =>
      scopeIds.has(p.scopeRef) &&
      roleIds.has(p.roleRef) &&
      topologyIds.has(p.topologyRef) &&
      governanceIds.has(p.governanceRef) &&
      dependencyIds.has(p.dependencyRef),
  );

  const gatesAligned = EXECUTION_POLICY_GATE_CATALOG.every((g) => catalogIds.has(g.policyRef));

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  const prioritiesUnique =
    new Set(EXECUTION_POLICY_CATALOG_ENTRIES.map((p) => p.priority)).size ===
    EXECUTION_POLICY_CATALOG_ENTRIES.length;

  return (
    catalogAligned &&
    gatesAligned &&
    kindsComplete &&
    prioritiesUnique &&
    EXECUTION_POLICY_CATALOG_ENTRIES.length === 8
  );
}

export function buildExecutionPolicyCatalogManifest(): ExecutionPolicyCatalogManifest {
  const policies = EXECUTION_POLICY_CATALOG_ENTRIES;
  const kinds = new Set(policies.map((p) => p.kind));
  const catalogComplete =
    policies.length === 8 && kinds.size === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V78_EXECUTION_POLICY_VERSION,
    entryCount: policies.length,
    kindCount: kinds.size,
    catalogComplete,
    policies,
    summary: [
      `execution-policy-catalog count=${policies.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildExecutionPolicyGateManifest(): ExecutionPolicyGateManifest {
  const gates = EXECUTION_POLICY_GATE_CATALOG;
  const catalogComplete = gates.length >= 8;

  return {
    version: V78_EXECUTION_POLICY_VERSION,
    gateCount: gates.length,
    catalogComplete,
    gates,
    summary: [
      `execution-policy-gates count=${gates.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getExecutionPolicyCatalogEntryById(
  id: string,
): ExecutionPolicyCatalogEntry | undefined {
  return EXECUTION_POLICY_CATALOG_ENTRIES.find((p) => p.id === id);
}

export function getExecutionPolicyCatalogEntriesByKind(
  kind: ExecutionPolicyCatalogEntry["kind"],
): ExecutionPolicyCatalogEntry[] {
  return EXECUTION_POLICY_CATALOG_ENTRIES.filter((p) => p.kind === kind);
}

export function getExecutionPolicyGateByPolicyRef(
  policyRef: string,
): ExecutionPolicyGate | undefined {
  return EXECUTION_POLICY_GATE_CATALOG.find((g) => g.policyRef === policyRef);
}

export function computeExecutionDeclarativePolicyBlock(input: {
  kind: ExecutionPolicyCatalogEntry["kind"];
  enforcement: ExecutionPolicyEnforcement;
}): boolean {
  return input.kind === "boundary" && input.enforcement === "gate";
}
