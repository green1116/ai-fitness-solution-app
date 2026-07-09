/**
 * V75 P2 — Agent policy catalog (declarative)
 */
import {
  AGENT_CONSTRAINT_CATALOG,
  AGENT_INPUT_CATALOG,
  AGENT_POLICY_CATALOG,
} from "./agent.inventory";
import { AGENT_SCOPE_CATALOG } from "./agent.scope";
import type {
  AgentPolicyCatalogEntry,
  AgentPolicyCatalogManifest,
  AgentPolicyEnforcement,
  AgentPolicyGate,
  AgentPolicyGateManifest,
} from "./agent.policy";
import { V75_AGENT_POLICY_VERSION } from "./agent.policy";

export const AGENT_POLICY_CATALOG_ENTRIES: AgentPolicyCatalogEntry[] = [
  {
    id: "AGT-PLC-001",
    kind: "safety",
    priority: 1,
    inventoryPolicyRef: "AGT-POL-001",
    inputRef: "AGT-INP-008",
    scopeRef: "AGT-SCP-008",
    constraintRef: "AGT-CST-001",
    enforcement: "gate",
    passCondition: "no-runtime-execution",
    blockCondition: "runtime-orchestration-detected",
    required: true,
    description: "Safety policy — declarative-only boundary with no runtime execution",
  },
  {
    id: "AGT-PLC-002",
    kind: "business",
    priority: 2,
    inventoryPolicyRef: "AGT-POL-002",
    inputRef: "AGT-INP-001",
    scopeRef: "AGT-SCP-002",
    constraintRef: "AGT-CST-002",
    enforcement: "declarative",
    passCondition: "business-objective-aligned",
    blockCondition: "objective-misaligned",
    required: true,
    description: "Business policy — align agents with fitness domain objectives",
  },
  {
    id: "AGT-PLC-003",
    kind: "cost",
    priority: 3,
    inventoryPolicyRef: "AGT-POL-003",
    inputRef: "AGT-INP-002",
    scopeRef: "AGT-SCP-003",
    constraintRef: "AGT-CST-003",
    enforcement: "audit-only",
    passCondition: "cost-within-budget",
    blockCondition: "cost-threshold-exceeded",
    required: true,
    description: "Cost policy — audit orchestration evaluation cost bounds",
  },
  {
    id: "AGT-PLC-004",
    kind: "quality",
    priority: 4,
    inventoryPolicyRef: "AGT-POL-004",
    inputRef: "AGT-INP-004",
    scopeRef: "AGT-SCP-003",
    constraintRef: "AGT-CST-005",
    enforcement: "gate",
    passCondition: "context-integrity-pass",
    blockCondition: "quality-gate-failed",
    required: true,
    description: "Quality policy — enforce context integrity quality gate",
  },
  {
    id: "AGT-PLC-005",
    kind: "priority",
    priority: 5,
    inventoryPolicyRef: "AGT-POL-005",
    inputRef: "AGT-INP-005",
    scopeRef: "AGT-SCP-006",
    constraintRef: "AGT-CST-006",
    enforcement: "declarative",
    passCondition: "priority-ranked",
    blockCondition: "priority-conflict",
    required: true,
    description: "Priority policy — rank compliance readiness by priority",
  },
  {
    id: "AGT-PLC-006",
    kind: "confidence",
    priority: 6,
    inventoryPolicyRef: "AGT-POL-006",
    inputRef: "AGT-INP-007",
    scopeRef: "AGT-SCP-006",
    constraintRef: "AGT-CST-007",
    enforcement: "gate",
    passCondition: "confidence-threshold-met",
    blockCondition: "low-confidence-unapproved",
    required: true,
    description: "Confidence policy — require confidence threshold for evaluation decisions",
  },
  {
    id: "AGT-PLC-007",
    kind: "fallback",
    priority: 7,
    inventoryPolicyRef: "AGT-POL-007",
    inputRef: "AGT-INP-006",
    scopeRef: "AGT-SCP-007",
    constraintRef: "AGT-CST-004",
    enforcement: "fallback",
    passCondition: "fallback-path-available",
    blockCondition: "no-fallback-defined",
    required: true,
    description: "Fallback policy — session transition fallback when primary path fails",
  },
  {
    id: "AGT-PLC-008",
    kind: "compliance",
    priority: 8,
    inventoryPolicyRef: "AGT-POL-008",
    inputRef: "AGT-INP-005",
    scopeRef: "AGT-SCP-006",
    constraintRef: "AGT-CST-008",
    enforcement: "gate",
    passCondition: "inventory-catalog-complete",
    blockCondition: "compliance-violation",
    required: true,
    description: "Compliance policy — require inventory catalog complete before orchestration",
  },
];

export const AGENT_POLICY_GATE_CATALOG: AgentPolicyGate[] = [
  {
    id: "AGT-PLG-001",
    policyRef: "AGT-PLC-001",
    gateKind: "safety",
    verifyScript: "declarative:no-runtime-execution",
    required: true,
    description: "Safety gate — no runtime execution",
  },
  {
    id: "AGT-PLG-002",
    policyRef: "AGT-PLC-002",
    gateKind: "business",
    verifyScript: "declarative:business-aligned",
    required: true,
    description: "Business alignment gate",
  },
  {
    id: "AGT-PLG-003",
    policyRef: "AGT-PLC-003",
    gateKind: "cost",
    verifyScript: "declarative:cost-audit",
    required: true,
    description: "Cost audit gate",
  },
  {
    id: "AGT-PLG-004",
    policyRef: "AGT-PLC-004",
    gateKind: "quality",
    verifyScript: "npx tsx scripts/verify-v74-p3-decision-context.ts",
    required: true,
    description: "Quality context integrity gate",
  },
  {
    id: "AGT-PLG-005",
    policyRef: "AGT-PLC-005",
    gateKind: "priority",
    verifyScript: "declarative:priority-ranked",
    required: true,
    description: "Priority ranking gate",
  },
  {
    id: "AGT-PLG-006",
    policyRef: "AGT-PLC-006",
    gateKind: "confidence",
    verifyScript: "declarative:confidence-threshold",
    required: true,
    description: "Confidence threshold gate",
  },
  {
    id: "AGT-PLG-007",
    policyRef: "AGT-PLC-007",
    gateKind: "fallback",
    verifyScript: "declarative:fallback-available",
    required: true,
    description: "Fallback path gate",
  },
  {
    id: "AGT-PLG-008",
    policyRef: "AGT-PLC-008",
    gateKind: "compliance",
    verifyScript: "npx tsx scripts/verify-v75-p1-agent-inventory.ts",
    required: true,
    description: "Compliance inventory gate",
  },
];

const REQUIRED_KINDS: AgentPolicyCatalogEntry["kind"][] = [
  "safety",
  "business",
  "cost",
  "quality",
  "priority",
  "confidence",
  "fallback",
  "compliance",
];

export function isAgentPolicyCatalogRefsAligned(): boolean {
  const scopeIds = new Set(AGENT_SCOPE_CATALOG.map((s) => s.id));
  const inputIds = new Set(AGENT_INPUT_CATALOG.map((i) => i.id));
  const inventoryPolicyIds = new Set(AGENT_POLICY_CATALOG.map((p) => p.id));
  const constraintIds = new Set(AGENT_CONSTRAINT_CATALOG.map((c) => c.id));
  const catalogIds = new Set(AGENT_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const kinds = new Set(AGENT_POLICY_CATALOG_ENTRIES.map((p) => p.kind));

  const catalogAligned = AGENT_POLICY_CATALOG_ENTRIES.every(
    (p) =>
      scopeIds.has(p.scopeRef) &&
      inputIds.has(p.inputRef) &&
      inventoryPolicyIds.has(p.inventoryPolicyRef) &&
      constraintIds.has(p.constraintRef),
  );

  const gatesAligned = AGENT_POLICY_GATE_CATALOG.every((g) => catalogIds.has(g.policyRef));

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  const prioritiesUnique =
    new Set(AGENT_POLICY_CATALOG_ENTRIES.map((p) => p.priority)).size ===
    AGENT_POLICY_CATALOG_ENTRIES.length;

  return (
    catalogAligned &&
    gatesAligned &&
    kindsComplete &&
    prioritiesUnique &&
    AGENT_POLICY_CATALOG_ENTRIES.length >= 8
  );
}

export function buildAgentPolicyCatalogManifest(): AgentPolicyCatalogManifest {
  const policies = AGENT_POLICY_CATALOG_ENTRIES;
  const kinds = new Set(policies.map((p) => p.kind));
  const catalogComplete =
    policies.length >= 8 && kinds.size >= 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V75_AGENT_POLICY_VERSION,
    entryCount: policies.length,
    kindCount: kinds.size,
    catalogComplete,
    policies,
    summary: [
      `agent-policy-catalog count=${policies.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAgentPolicyGateManifest(): AgentPolicyGateManifest {
  const gates = AGENT_POLICY_GATE_CATALOG;
  const catalogComplete = gates.length >= 8;

  return {
    version: V75_AGENT_POLICY_VERSION,
    gateCount: gates.length,
    catalogComplete,
    gates,
    summary: [
      `agent-policy-gates count=${gates.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAgentPolicyCatalogEntryById(
  id: string,
): AgentPolicyCatalogEntry | undefined {
  return AGENT_POLICY_CATALOG_ENTRIES.find((p) => p.id === id);
}

export function getAgentPolicyCatalogEntriesByKind(
  kind: AgentPolicyCatalogEntry["kind"],
): AgentPolicyCatalogEntry[] {
  return AGENT_POLICY_CATALOG_ENTRIES.filter((p) => p.kind === kind);
}

export function getAgentPolicyGateByPolicyRef(policyRef: string): AgentPolicyGate | undefined {
  return AGENT_POLICY_GATE_CATALOG.find((g) => g.policyRef === policyRef);
}

export function computeAgentDeclarativePolicyBlock(input: {
  kind: AgentPolicyCatalogEntry["kind"];
  enforcement: AgentPolicyEnforcement;
}): boolean {
  return input.kind === "safety" && input.enforcement === "gate";
}
