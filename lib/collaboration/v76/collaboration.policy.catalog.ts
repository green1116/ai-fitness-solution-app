/**
 * V76 P2 — Collaboration policy catalog (declarative)
 */
import {
  COLLABORATION_CONSTRAINT_CATALOG,
  COLLABORATION_INPUT_CATALOG,
  COLLABORATION_POLICY_CATALOG,
} from "./collaboration.inventory";
import { COLLABORATION_SCOPE_CATALOG } from "./collaboration.scope";
import type {
  CollaborationPolicyCatalogEntry,
  CollaborationPolicyCatalogManifest,
  CollaborationPolicyEnforcement,
  CollaborationPolicyGate,
  CollaborationPolicyGateManifest,
} from "./collaboration.policy";
import { V76_COLLABORATION_POLICY_VERSION } from "./collaboration.policy";

const REQUIRED_KINDS: CollaborationPolicyCatalogEntry["kind"][] = [
  "role",
  "communication",
  "delegation",
  "coordination",
  "conflict",
  "governance",
  "boundary",
  "compliance",
];

export const COLLABORATION_POLICY_CATALOG_ENTRIES: CollaborationPolicyCatalogEntry[] = [
  {
    id: "COL-PLC-001",
    kind: "boundary",
    priority: 1,
    inventoryPolicyRef: "COL-POL-001",
    inputRef: "COL-INP-008",
    scopeRef: "COL-SCP-008",
    constraintRef: "COL-CST-001",
    enforcement: "gate",
    passCondition: "no-runtime-execution",
    blockCondition: "runtime-multi-agent-detected",
    required: true,
    description: "Boundary policy — declarative-only with no runtime multi-agent execution",
  },
  {
    id: "COL-PLC-002",
    kind: "role",
    priority: 2,
    inventoryPolicyRef: "COL-POL-002",
    inputRef: "COL-INP-001",
    scopeRef: "COL-SCP-001",
    constraintRef: "COL-CST-002",
    enforcement: "declarative",
    passCondition: "shared-role-defined",
    blockCondition: "role-undefined",
    required: true,
    description: "Role policy — shared collaboration roles from agent freeze baseline",
  },
  {
    id: "COL-PLC-003",
    kind: "communication",
    priority: 3,
    inventoryPolicyRef: "COL-POL-004",
    inputRef: "COL-INP-003",
    scopeRef: "COL-SCP-006",
    constraintRef: "COL-CST-004",
    enforcement: "gate",
    passCondition: "communication-contract-pass",
    blockCondition: "contract-violation",
    required: true,
    description: "Communication policy — enforce inter-agent communication contracts",
  },
  {
    id: "COL-PLC-004",
    kind: "delegation",
    priority: 4,
    inventoryPolicyRef: "COL-POL-005",
    inputRef: "COL-INP-004",
    scopeRef: "COL-SCP-003",
    constraintRef: "COL-CST-005",
    enforcement: "gate",
    passCondition: "delegation-boundary-intact",
    blockCondition: "delegation-violation",
    required: true,
    description: "Delegation policy — honor delegation boundaries per collaboration matrix",
  },
  {
    id: "COL-PLC-005",
    kind: "coordination",
    priority: 5,
    inventoryPolicyRef: "COL-POL-006",
    inputRef: "COL-INP-005",
    scopeRef: "COL-SCP-006",
    constraintRef: "COL-CST-006",
    enforcement: "declarative",
    passCondition: "coordination-readiness-ranked",
    blockCondition: "coordination-conflict",
    required: true,
    description: "Coordination policy — rank coordination readiness by priority",
  },
  {
    id: "COL-PLC-006",
    kind: "conflict",
    priority: 6,
    inventoryPolicyRef: "COL-POL-003",
    inputRef: "COL-INP-002",
    scopeRef: "COL-SCP-003",
    constraintRef: "COL-CST-003",
    enforcement: "audit-only",
    passCondition: "topology-acyclic",
    blockCondition: "topology-cycle-detected",
    required: true,
    description: "Conflict policy — reject cyclic collaboration topology paths",
  },
  {
    id: "COL-PLC-007",
    kind: "governance",
    priority: 7,
    inventoryPolicyRef: "COL-POL-007",
    inputRef: "COL-INP-007",
    scopeRef: "COL-SCP-006",
    constraintRef: "COL-CST-007",
    enforcement: "gate",
    passCondition: "governance-inventory-pass",
    blockCondition: "governance-violation",
    required: true,
    description: "Governance policy — require governance inventory pass for collaboration",
  },
  {
    id: "COL-PLC-008",
    kind: "compliance",
    priority: 8,
    inventoryPolicyRef: "COL-POL-008",
    inputRef: "COL-INP-008",
    scopeRef: "COL-SCP-008",
    constraintRef: "COL-CST-008",
    enforcement: "gate",
    passCondition: "inventory-catalog-complete",
    blockCondition: "compliance-violation",
    required: true,
    description: "Compliance policy — require inventory catalog complete before sign-off",
  },
];

export const COLLABORATION_POLICY_GATE_CATALOG: CollaborationPolicyGate[] = [
  {
    id: "COL-PLG-001",
    policyRef: "COL-PLC-001",
    gateKind: "boundary",
    verifyScript: "declarative:no-runtime-execution",
    required: true,
    description: "Boundary gate — no runtime multi-agent execution",
  },
  {
    id: "COL-PLG-002",
    policyRef: "COL-PLC-002",
    gateKind: "role",
    verifyScript: "declarative:shared-role-defined",
    required: true,
    description: "Role policy gate",
  },
  {
    id: "COL-PLG-003",
    policyRef: "COL-PLC-003",
    gateKind: "communication",
    verifyScript: "declarative:communication-contract",
    required: true,
    description: "Communication contract gate",
  },
  {
    id: "COL-PLG-004",
    policyRef: "COL-PLC-004",
    gateKind: "delegation",
    verifyScript: "declarative:delegation-boundary",
    required: true,
    description: "Delegation boundary gate",
  },
  {
    id: "COL-PLG-005",
    policyRef: "COL-PLC-005",
    gateKind: "coordination",
    verifyScript: "declarative:coordination-ranked",
    required: true,
    description: "Coordination readiness gate",
  },
  {
    id: "COL-PLG-006",
    policyRef: "COL-PLC-006",
    gateKind: "conflict",
    verifyScript: "declarative:topology-acyclic",
    required: true,
    description: "Conflict topology gate",
  },
  {
    id: "COL-PLG-007",
    policyRef: "COL-PLC-007",
    gateKind: "governance",
    verifyScript: "declarative:governance-inventory",
    required: true,
    description: "Governance inventory gate",
  },
  {
    id: "COL-PLG-008",
    policyRef: "COL-PLC-008",
    gateKind: "compliance",
    verifyScript: "npx tsx scripts/verify-v76-p1-collaboration-inventory.ts",
    required: true,
    description: "Compliance inventory gate",
  },
];

export function isCollaborationPolicyCatalogRefsAligned(): boolean {
  const scopeIds = new Set(COLLABORATION_SCOPE_CATALOG.map((s) => s.id));
  const inputIds = new Set(COLLABORATION_INPUT_CATALOG.map((i) => i.id));
  const inventoryPolicyIds = new Set(COLLABORATION_POLICY_CATALOG.map((p) => p.id));
  const constraintIds = new Set(COLLABORATION_CONSTRAINT_CATALOG.map((c) => c.id));
  const catalogIds = new Set(COLLABORATION_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const kinds = new Set(COLLABORATION_POLICY_CATALOG_ENTRIES.map((p) => p.kind));

  const catalogAligned = COLLABORATION_POLICY_CATALOG_ENTRIES.every(
    (p) =>
      scopeIds.has(p.scopeRef) &&
      inputIds.has(p.inputRef) &&
      inventoryPolicyIds.has(p.inventoryPolicyRef) &&
      constraintIds.has(p.constraintRef),
  );

  const gatesAligned = COLLABORATION_POLICY_GATE_CATALOG.every((g) =>
    catalogIds.has(g.policyRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  const prioritiesUnique =
    new Set(COLLABORATION_POLICY_CATALOG_ENTRIES.map((p) => p.priority)).size ===
    COLLABORATION_POLICY_CATALOG_ENTRIES.length;

  return (
    catalogAligned &&
    gatesAligned &&
    kindsComplete &&
    prioritiesUnique &&
    COLLABORATION_POLICY_CATALOG_ENTRIES.length >= 8
  );
}

export function buildCollaborationPolicyCatalogManifest(): CollaborationPolicyCatalogManifest {
  const policies = COLLABORATION_POLICY_CATALOG_ENTRIES;
  const kinds = new Set(policies.map((p) => p.kind));
  const catalogComplete =
    policies.length >= 8 && kinds.size >= 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V76_COLLABORATION_POLICY_VERSION,
    entryCount: policies.length,
    kindCount: kinds.size,
    catalogComplete,
    policies,
    summary: [
      `collaboration-policy-catalog count=${policies.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCollaborationPolicyGateManifest(): CollaborationPolicyGateManifest {
  const gates = COLLABORATION_POLICY_GATE_CATALOG;
  const catalogComplete = gates.length >= 8;

  return {
    version: V76_COLLABORATION_POLICY_VERSION,
    gateCount: gates.length,
    catalogComplete,
    gates,
    summary: [
      `collaboration-policy-gates count=${gates.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getCollaborationPolicyCatalogEntryById(
  id: string,
): CollaborationPolicyCatalogEntry | undefined {
  return COLLABORATION_POLICY_CATALOG_ENTRIES.find((p) => p.id === id);
}

export function getCollaborationPolicyCatalogEntriesByKind(
  kind: CollaborationPolicyCatalogEntry["kind"],
): CollaborationPolicyCatalogEntry[] {
  return COLLABORATION_POLICY_CATALOG_ENTRIES.filter((p) => p.kind === kind);
}

export function getCollaborationPolicyGateByPolicyRef(
  policyRef: string,
): CollaborationPolicyGate | undefined {
  return COLLABORATION_POLICY_GATE_CATALOG.find((g) => g.policyRef === policyRef);
}

export function computeCollaborationDeclarativePolicyBlock(input: {
  kind: CollaborationPolicyCatalogEntry["kind"];
  enforcement: CollaborationPolicyEnforcement;
}): boolean {
  return input.kind === "boundary" && input.enforcement === "gate";
}
