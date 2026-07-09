/**
 * V74 P2 — Decision policy catalog (declarative)
 */
import { DECISION_INPUT_CATALOG, DECISION_POLICY_CATALOG } from "./decision.inventory";
import { DECISION_SCOPE_CATALOG } from "./decision.scope";
import type {
  PolicyCatalogEntry,
  PolicyCatalogManifest,
  PolicyEnforcement,
  PolicyGate,
  PolicyGateManifest,
} from "./decision.policy";
import { V74_DECISION_POLICY_VERSION } from "./decision.policy";

export const POLICY_CATALOG_ENTRIES: PolicyCatalogEntry[] = [
  {
    id: "DEC-PLC-001",
    kind: "safety",
    inventoryPolicyRef: "DEC-POL-001",
    inputRef: "DEC-INP-008",
    scopeRef: "DEC-SCP-008",
    enforcement: "gate",
    passCondition: "no-runtime-mutation",
    blockCondition: "runtime-side-effect-detected",
    required: true,
    description: "Safety policy — declarative-only boundary with no runtime mutation",
  },
  {
    id: "DEC-PLC-002",
    kind: "business",
    inventoryPolicyRef: "DEC-POL-002",
    inputRef: "DEC-INP-001",
    scopeRef: "DEC-SCP-002",
    enforcement: "declarative",
    passCondition: "business-objective-aligned",
    blockCondition: "objective-misaligned",
    required: true,
    description: "Business policy — align decisions with fitness domain objectives",
  },
  {
    id: "DEC-PLC-003",
    kind: "cost",
    inventoryPolicyRef: "DEC-POL-003",
    inputRef: "DEC-INP-002",
    scopeRef: "DEC-SCP-003",
    enforcement: "audit-only",
    passCondition: "cost-within-budget",
    blockCondition: "cost-threshold-exceeded",
    required: true,
    description: "Cost policy — audit dependency evaluation cost bounds",
  },
  {
    id: "DEC-PLC-004",
    kind: "quality",
    inventoryPolicyRef: "DEC-POL-004",
    inputRef: "DEC-INP-004",
    scopeRef: "DEC-SCP-003",
    enforcement: "gate",
    passCondition: "compatibility-matrix-pass",
    blockCondition: "quality-gate-failed",
    required: true,
    description: "Quality policy — enforce compatibility matrix quality gate",
  },
  {
    id: "DEC-PLC-005",
    kind: "priority",
    inventoryPolicyRef: "DEC-POL-005",
    inputRef: "DEC-INP-005",
    scopeRef: "DEC-SCP-006",
    enforcement: "declarative",
    passCondition: "priority-ranked",
    blockCondition: "priority-conflict",
    required: true,
    description: "Priority policy — rank governance risk decisions by priority",
  },
  {
    id: "DEC-PLC-006",
    kind: "confidence",
    inventoryPolicyRef: "DEC-POL-006",
    inputRef: "DEC-INP-007",
    scopeRef: "DEC-SCP-006",
    enforcement: "gate",
    passCondition: "confidence-threshold-met",
    blockCondition: "low-confidence-unapproved",
    required: true,
    description: "Confidence policy — require confidence threshold for compliance decisions",
  },
  {
    id: "DEC-PLC-007",
    kind: "fallback",
    inventoryPolicyRef: "DEC-POL-007",
    inputRef: "DEC-INP-006",
    scopeRef: "DEC-SCP-007",
    enforcement: "fallback",
    passCondition: "fallback-path-available",
    blockCondition: "no-fallback-defined",
    required: true,
    description: "Fallback policy — lifecycle transition fallback when primary path fails",
  },
  {
    id: "DEC-PLC-008",
    kind: "compliance",
    inventoryPolicyRef: "DEC-POL-008",
    inputRef: "DEC-INP-007",
    scopeRef: "DEC-SCP-006",
    enforcement: "gate",
    passCondition: "compliance-checklist-pass",
    blockCondition: "compliance-violation",
    required: true,
    description: "Compliance policy — require compliance checklist pass before freeze",
  },
];

export const POLICY_GATE_CATALOG: PolicyGate[] = [
  {
    id: "DEC-PLG-001",
    policyRef: "DEC-PLC-001",
    gateKind: "safety",
    verifyScript: "declarative:no-runtime-mutation",
    required: true,
    description: "Safety gate — no runtime mutation",
  },
  {
    id: "DEC-PLG-002",
    policyRef: "DEC-PLC-002",
    gateKind: "business",
    verifyScript: "declarative:business-aligned",
    required: true,
    description: "Business alignment gate",
  },
  {
    id: "DEC-PLG-003",
    policyRef: "DEC-PLC-003",
    gateKind: "cost",
    verifyScript: "declarative:cost-audit",
    required: true,
    description: "Cost audit gate",
  },
  {
    id: "DEC-PLG-004",
    policyRef: "DEC-PLC-004",
    gateKind: "quality",
    verifyScript: "npx tsx scripts/verify-v73-p4-knowledge-compatibility.ts",
    required: true,
    description: "Quality compatibility gate",
  },
  {
    id: "DEC-PLG-005",
    policyRef: "DEC-PLC-005",
    gateKind: "priority",
    verifyScript: "declarative:priority-ranked",
    required: true,
    description: "Priority ranking gate",
  },
  {
    id: "DEC-PLG-006",
    policyRef: "DEC-PLC-006",
    gateKind: "confidence",
    verifyScript: "declarative:confidence-threshold",
    required: true,
    description: "Confidence threshold gate",
  },
  {
    id: "DEC-PLG-007",
    policyRef: "DEC-PLC-007",
    gateKind: "fallback",
    verifyScript: "declarative:fallback-available",
    required: true,
    description: "Fallback path gate",
  },
  {
    id: "DEC-PLG-008",
    policyRef: "DEC-PLC-008",
    gateKind: "compliance",
    verifyScript: "npx tsx scripts/verify-v73-p7-knowledge-compliance.ts",
    required: true,
    description: "Compliance checklist gate",
  },
];

const REQUIRED_KINDS: PolicyCatalogEntry["kind"][] = [
  "safety",
  "business",
  "cost",
  "quality",
  "priority",
  "confidence",
  "fallback",
  "compliance",
];

export function isDecisionPolicyCatalogRefsAligned(): boolean {
  const scopeIds = new Set(DECISION_SCOPE_CATALOG.map((s) => s.id));
  const inputIds = new Set(DECISION_INPUT_CATALOG.map((i) => i.id));
  const inventoryPolicyIds = new Set(DECISION_POLICY_CATALOG.map((p) => p.id));
  const catalogIds = new Set(POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const kinds = new Set(POLICY_CATALOG_ENTRIES.map((p) => p.kind));

  const catalogAligned = POLICY_CATALOG_ENTRIES.every(
    (p) =>
      scopeIds.has(p.scopeRef) &&
      inputIds.has(p.inputRef) &&
      inventoryPolicyIds.has(p.inventoryPolicyRef),
  );

  const gatesAligned = POLICY_GATE_CATALOG.every((g) => catalogIds.has(g.policyRef));

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return catalogAligned && gatesAligned && kindsComplete && POLICY_CATALOG_ENTRIES.length >= 8;
}

export function buildPolicyCatalogManifest(): PolicyCatalogManifest {
  const policies = POLICY_CATALOG_ENTRIES;
  const kinds = new Set(policies.map((p) => p.kind));
  const catalogComplete =
    policies.length >= 8 && kinds.size >= 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V74_DECISION_POLICY_VERSION,
    entryCount: policies.length,
    kindCount: kinds.size,
    catalogComplete,
    policies,
    summary: [
      `decision-policy-catalog count=${policies.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPolicyGateManifest(): PolicyGateManifest {
  const gates = POLICY_GATE_CATALOG;
  const catalogComplete = gates.length >= 8;

  return {
    version: V74_DECISION_POLICY_VERSION,
    gateCount: gates.length,
    catalogComplete,
    gates,
    summary: [
      `decision-policy-gates count=${gates.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getPolicyCatalogEntryById(id: string): PolicyCatalogEntry | undefined {
  return POLICY_CATALOG_ENTRIES.find((p) => p.id === id);
}

export function getPolicyCatalogEntriesByKind(
  kind: PolicyCatalogEntry["kind"],
): PolicyCatalogEntry[] {
  return POLICY_CATALOG_ENTRIES.filter((p) => p.kind === kind);
}

export function getPolicyGateByPolicyRef(policyRef: string): PolicyGate | undefined {
  return POLICY_GATE_CATALOG.find((g) => g.policyRef === policyRef);
}

export function computeDeclarativePolicyBlock(input: {
  kind: PolicyCatalogEntry["kind"];
  enforcement: PolicyEnforcement;
}): boolean {
  return input.kind === "safety" && input.enforcement === "gate";
}
