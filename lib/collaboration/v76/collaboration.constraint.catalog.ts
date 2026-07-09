/**
 * V76 P4 — Collaboration constraint catalog (declarative)
 */
import { COLLABORATION_CONTEXT_CATALOG_ENTRIES } from "./collaboration.context.catalog";
import { COLLABORATION_CONSTRAINT_CATALOG } from "./collaboration.inventory";
import { COLLABORATION_POLICY_CATALOG_ENTRIES } from "./collaboration.policy.catalog";
import { COLLABORATION_SCOPE_CATALOG } from "./collaboration.scope";
import type {
  CollaborationConstraintCatalogEntry,
  CollaborationConstraintCatalogManifest,
  CollaborationConstraintKind,
  CollaborationConstraintValidation,
  CollaborationConstraintValidationManifest,
} from "./collaboration.constraint";
import { V76_COLLABORATION_CONSTRAINT_VERSION } from "./collaboration.constraint";

const REQUIRED_KINDS: CollaborationConstraintKind[] = [
  "shared",
  "topology",
  "communication",
  "delegation",
  "coordination",
  "governance",
  "workspace",
  "boundary",
];

export const COLLABORATION_CONSTRAINT_CATALOG_ENTRIES: CollaborationConstraintCatalogEntry[] = [
  {
    id: "COL-CON-001",
    kind: "shared",
    purpose: "Require V75 agent freeze intact for shared collaboration baseline",
    scopeRef: "COL-SCP-001",
    level: "L1",
    trigger: "collaboration-eval-start",
    condition: "upstream-agent-freeze-intact",
    resolution: "block-until-pass",
    priority: "high",
    validation: "COL-CNV-001",
    inventoryConstraintRef: "COL-CST-002",
    contextRef: "COL-CTX-001",
    policyRef: "COL-PLC-002",
    required: true,
    description: "Shared constraint — upstream agent freeze baseline",
  },
  {
    id: "COL-CON-002",
    kind: "topology",
    purpose: "Require acyclic collaboration topology graph",
    scopeRef: "COL-SCP-003",
    level: "L1",
    trigger: "topology-graph-evaluated",
    condition: "acyclic-topology-required",
    resolution: "reject-cycle",
    priority: "critical",
    validation: "COL-CNV-002",
    inventoryConstraintRef: "COL-CST-003",
    contextRef: "COL-CTX-002",
    policyRef: "COL-PLC-006",
    required: true,
    description: "Topology constraint — acyclic graph required",
  },
  {
    id: "COL-CON-003",
    kind: "communication",
    purpose: "Require communication contract pass before collaboration proceeds",
    scopeRef: "COL-SCP-006",
    level: "L1",
    trigger: "communication-contract-check",
    condition: "communication-contract-required",
    resolution: "block-and-audit",
    priority: "critical",
    validation: "COL-CNV-003",
    inventoryConstraintRef: "COL-CST-004",
    contextRef: "COL-CTX-003",
    policyRef: "COL-PLC-003",
    required: true,
    description: "Communication constraint — contract enforcement",
  },
  {
    id: "COL-CON-004",
    kind: "delegation",
    purpose: "Require delegation boundary completeness",
    scopeRef: "COL-SCP-003",
    level: "L1",
    trigger: "delegation-boundary-check",
    condition: "delegation-boundary-required",
    resolution: "escalate-to-governance",
    priority: "high",
    validation: "COL-CNV-004",
    inventoryConstraintRef: "COL-CST-005",
    contextRef: "COL-CTX-004",
    policyRef: "COL-PLC-004",
    required: true,
    description: "Delegation constraint — boundary completeness",
  },
  {
    id: "COL-CON-005",
    kind: "coordination",
    purpose: "Bound coordination readiness within declared limits",
    scopeRef: "COL-SCP-006",
    level: "L2",
    trigger: "coordination-readiness-check",
    condition: "coordination-readiness-bounded",
    resolution: "rank-and-audit",
    priority: "medium",
    validation: "COL-CNV-005",
    inventoryConstraintRef: "COL-CST-006",
    contextRef: "COL-CTX-005",
    policyRef: "COL-PLC-005",
    required: true,
    description: "Coordination constraint — readiness bounded",
  },
  {
    id: "COL-CON-006",
    kind: "governance",
    purpose: "Require governance inventory checklist complete",
    scopeRef: "COL-SCP-006",
    level: "L1",
    trigger: "governance-checklist-gate",
    condition: "governance-checklist-required",
    resolution: "block-until-pass",
    priority: "high",
    validation: "COL-CNV-006",
    inventoryConstraintRef: "COL-CST-007",
    contextRef: "COL-CTX-007",
    policyRef: "COL-PLC-007",
    required: true,
    description: "Governance constraint — checklist required",
  },
  {
    id: "COL-CON-007",
    kind: "workspace",
    purpose: "Verify collaboration inventory catalog completeness",
    scopeRef: "COL-SCP-008",
    level: "L2",
    trigger: "post-catalog-verify",
    condition: "inventory-catalog-complete",
    resolution: "record-audit-trail",
    priority: "high",
    validation: "COL-CNV-007",
    inventoryConstraintRef: "COL-CST-008",
    contextRef: "COL-CTX-008",
    policyRef: "COL-PLC-008",
    required: true,
    description: "Workspace constraint — inventory catalog complete",
  },
  {
    id: "COL-CON-008",
    kind: "boundary",
    purpose: "Enforce declarative-only boundary with no runtime execution",
    scopeRef: "COL-SCP-008",
    level: "critical",
    trigger: "collaboration-boundary-eval",
    condition: "no-runtime-execution",
    resolution: "block-and-audit",
    priority: "critical",
    validation: "COL-CNV-008",
    inventoryConstraintRef: "COL-CST-001",
    contextRef: "COL-CTX-008",
    policyRef: "COL-PLC-001",
    required: true,
    description: "Boundary constraint — no runtime multi-agent execution",
  },
];

export const COLLABORATION_CONSTRAINT_VALIDATION_CATALOG: CollaborationConstraintValidation[] = [
  {
    id: "COL-CNV-001",
    constraintRef: "COL-CON-001",
    validationKind: "shared",
    passCondition: "upstream-freeze-intact",
    required: true,
    description: "Shared constraint validation — agent freeze intact",
  },
  {
    id: "COL-CNV-002",
    constraintRef: "COL-CON-002",
    validationKind: "topology",
    passCondition: "acyclic-graph-verified",
    required: true,
    description: "Topology constraint validation — acyclic graph",
  },
  {
    id: "COL-CNV-003",
    constraintRef: "COL-CON-003",
    validationKind: "communication",
    passCondition: "communication-contract-pass",
    required: true,
    description: "Communication constraint validation — contract pass",
  },
  {
    id: "COL-CNV-004",
    constraintRef: "COL-CON-004",
    validationKind: "delegation",
    passCondition: "delegation-boundary-intact",
    required: true,
    description: "Delegation constraint validation — boundary intact",
  },
  {
    id: "COL-CNV-005",
    constraintRef: "COL-CON-005",
    validationKind: "coordination",
    passCondition: "coordination-readiness-bounded",
    required: true,
    description: "Coordination constraint validation — readiness bounded",
  },
  {
    id: "COL-CNV-006",
    constraintRef: "COL-CON-006",
    validationKind: "governance",
    passCondition: "governance-checklist-complete",
    required: true,
    description: "Governance constraint validation — checklist complete",
  },
  {
    id: "COL-CNV-007",
    constraintRef: "COL-CON-007",
    validationKind: "workspace",
    passCondition: "inventory-catalog-complete",
    required: true,
    description: "Workspace constraint validation — catalog complete",
  },
  {
    id: "COL-CNV-008",
    constraintRef: "COL-CON-008",
    validationKind: "boundary",
    passCondition: "declarative-only-confirmed",
    required: true,
    description: "Boundary constraint validation — no runtime execution",
  },
];

export function isCollaborationConstraintCatalogRefsAligned(): boolean {
  const inventoryConstraintIds = new Set(COLLABORATION_CONSTRAINT_CATALOG.map((c) => c.id));
  const contextIds = new Set(COLLABORATION_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const policyIds = new Set(COLLABORATION_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const scopeIds = new Set(COLLABORATION_SCOPE_CATALOG.map((s) => s.id));
  const validationIds = new Set(COLLABORATION_CONSTRAINT_VALIDATION_CATALOG.map((v) => v.id));
  const constraintIds = new Set(COLLABORATION_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const kinds = new Set(COLLABORATION_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.kind));

  const constraintsAligned = COLLABORATION_CONSTRAINT_CATALOG_ENTRIES.every(
    (c) =>
      inventoryConstraintIds.has(c.inventoryConstraintRef) &&
      contextIds.has(c.contextRef) &&
      policyIds.has(c.policyRef) &&
      scopeIds.has(c.scopeRef) &&
      validationIds.has(c.validation),
  );

  const validationsAligned = COLLABORATION_CONSTRAINT_VALIDATION_CATALOG.every((v) =>
    constraintIds.has(v.constraintRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    constraintsAligned &&
    validationsAligned &&
    kindsComplete &&
    COLLABORATION_CONSTRAINT_CATALOG_ENTRIES.length === 8
  );
}

export function buildCollaborationConstraintCatalogManifest(): CollaborationConstraintCatalogManifest {
  const constraints = COLLABORATION_CONSTRAINT_CATALOG_ENTRIES;
  const kinds = new Set(constraints.map((c) => c.kind));
  const catalogComplete =
    constraints.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k));

  return {
    version: V76_COLLABORATION_CONSTRAINT_VERSION,
    entryCount: constraints.length,
    kindCount: kinds.size,
    catalogComplete,
    constraints,
    summary: [
      `collaboration-constraint-catalog count=${constraints.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCollaborationConstraintValidationManifest(): CollaborationConstraintValidationManifest {
  const validations = COLLABORATION_CONSTRAINT_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V76_COLLABORATION_CONSTRAINT_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `collaboration-constraint-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getCollaborationConstraintCatalogEntryById(
  id: string,
): CollaborationConstraintCatalogEntry | undefined {
  return COLLABORATION_CONSTRAINT_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getCollaborationConstraintCatalogEntriesByKind(
  kind: CollaborationConstraintKind,
): CollaborationConstraintCatalogEntry[] {
  return COLLABORATION_CONSTRAINT_CATALOG_ENTRIES.filter((c) => c.kind === kind);
}

export function getCollaborationConstraintValidationByConstraintRef(
  constraintRef: string,
): CollaborationConstraintValidation | undefined {
  return COLLABORATION_CONSTRAINT_VALIDATION_CATALOG.find((v) => v.constraintRef === constraintRef);
}

export function computeCollaborationDeclarativeConstraintBlock(input: {
  kind: CollaborationConstraintKind;
  level: CollaborationConstraintCatalogEntry["level"];
}): boolean {
  return input.kind === "boundary" && input.level === "critical";
}
