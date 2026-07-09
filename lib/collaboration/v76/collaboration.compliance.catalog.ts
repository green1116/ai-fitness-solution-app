/**
 * V76 P7 — Collaboration compliance catalog (declarative)
 */
import { COLLABORATION_CONSTRAINT_CATALOG_ENTRIES } from "./collaboration.constraint.catalog";
import { COLLABORATION_CONTEXT_CATALOG_ENTRIES } from "./collaboration.context.catalog";
import { COLLABORATION_EVALUATION_CATALOG_ENTRIES } from "./collaboration.evaluation.catalog";
import { COLLABORATION_INPUT_CATALOG, COLLABORATION_OUTPUT_CATALOG } from "./collaboration.inventory";
import { COLLABORATION_POLICY_CATALOG_ENTRIES } from "./collaboration.policy.catalog";
import { COLLABORATION_SIMULATION_CATALOG_ENTRIES } from "./collaboration.simulation.catalog";
import type {
  CollaborationComplianceCatalogEntry,
  CollaborationComplianceCatalogManifest,
  CollaborationComplianceKind,
  CollaborationComplianceValidation,
  CollaborationComplianceValidationManifest,
} from "./collaboration.compliance";
import { V76_COLLABORATION_COMPLIANCE_VERSION } from "./collaboration.compliance";

const REQUIRED_KINDS: CollaborationComplianceKind[] = [
  "shared",
  "topology",
  "communication",
  "delegation",
  "coordination",
  "governance",
  "workspace",
  "boundary",
];

export const COLLABORATION_COMPLIANCE_CATALOG_ENTRIES: CollaborationComplianceCatalogEntry[] = [
  {
    id: "COL-CMP-001",
    kind: "shared",
    purpose: "Verify shared collaboration baseline compliance rules",
    rule: "upstream-agent-freeze-must-remain-intact",
    auditPoint: "verify:v76-p6-collaboration-simulation-catalog",
    waiverCondition: "governance-approved-shared-exception",
    inputs: ["COL-INP-001"],
    outputs: ["COL-OUT-001"],
    criteria: ["freeze-intact", "shared-rules-documented"],
    evidence: "COL-SIM-001 shared simulation declared",
    status: "passed",
    validation: "COL-CML-001",
    upstreamRef: "COL-SIM-001",
    required: true,
    description: "Shared compliance — baseline freeze rules",
  },
  {
    id: "COL-CMP-002",
    kind: "topology",
    purpose: "Verify topology acyclicity compliance rules",
    rule: "topology-graph-must-be-acyclic",
    auditPoint: "verify:v76-p4-collaboration-constraint-catalog",
    waiverCondition: "topology-exception-not-permitted",
    inputs: ["COL-INP-002"],
    outputs: ["COL-OUT-002"],
    criteria: ["acyclic-verified", "topology-rules-documented"],
    evidence: "COL-SIM-002 topology simulation declared",
    status: "passed",
    validation: "COL-CML-002",
    upstreamRef: "COL-SIM-002",
    required: true,
    description: "Topology compliance — acyclic graph rules",
  },
  {
    id: "COL-CMP-003",
    kind: "communication",
    purpose: "Verify communication contract compliance rules",
    rule: "communication-contract-must-pass",
    auditPoint: "verify:v76-p5-collaboration-evaluation-catalog",
    waiverCondition: "communication-waiver-with-audit-trail",
    inputs: ["COL-INP-003"],
    outputs: ["COL-OUT-003"],
    criteria: ["contract-pass", "communication-rules-documented"],
    evidence: "COL-SIM-003 communication simulation declared",
    status: "passed",
    validation: "COL-CML-003",
    upstreamRef: "COL-SIM-003",
    required: true,
    description: "Communication compliance — contract enforcement rules",
  },
  {
    id: "COL-CMP-004",
    kind: "delegation",
    purpose: "Verify delegation boundary compliance rules",
    rule: "delegation-boundary-must-be-complete",
    auditPoint: "verify:v76-p4-collaboration-constraint-catalog",
    waiverCondition: "delegation-exception-governance-approved",
    inputs: ["COL-INP-004"],
    outputs: ["COL-OUT-004"],
    criteria: ["boundary-intact", "delegation-rules-documented"],
    evidence: "COL-SIM-004 delegation simulation declared",
    status: "passed",
    validation: "COL-CML-004",
    upstreamRef: "COL-SIM-004",
    required: true,
    description: "Delegation compliance — boundary completeness rules",
  },
  {
    id: "COL-CMP-005",
    kind: "coordination",
    purpose: "Verify coordination readiness compliance rules",
    rule: "coordination-readiness-must-be-bounded",
    auditPoint: "verify:v76-p5-collaboration-evaluation-catalog",
    waiverCondition: "coordination-scope-reduction-approved",
    inputs: ["COL-INP-005"],
    outputs: ["COL-OUT-005"],
    criteria: ["readiness-bounded", "coordination-rules-documented"],
    evidence: "COL-SIM-005 coordination simulation declared",
    status: "passed",
    validation: "COL-CML-005",
    upstreamRef: "COL-SIM-005",
    required: true,
    description: "Coordination compliance — readiness bounded rules",
  },
  {
    id: "COL-CMP-006",
    kind: "governance",
    purpose: "Verify governance checklist compliance rules",
    rule: "governance-checklist-must-be-complete",
    auditPoint: "verify:v76-p2-collaboration-policy-catalog",
    waiverCondition: "governance-deferral-with-expiry",
    inputs: ["COL-INP-007"],
    outputs: ["COL-OUT-007"],
    criteria: ["checklist-complete", "governance-rules-documented"],
    evidence: "COL-SIM-006 governance simulation declared",
    status: "passed",
    validation: "COL-CML-006",
    upstreamRef: "COL-SIM-006",
    required: true,
    description: "Governance compliance — checklist completeness rules",
  },
  {
    id: "COL-CMP-007",
    kind: "workspace",
    purpose: "Verify workspace inventory catalog compliance rules",
    rule: "inventory-catalog-must-be-complete",
    auditPoint: "verify:v76-p1-collaboration-inventory",
    waiverCondition: "workspace-waiver-governance-approved",
    inputs: ["COL-INP-008"],
    outputs: ["COL-OUT-008"],
    criteria: ["catalog-complete", "workspace-rules-documented"],
    evidence: "COL-SIM-007 workspace simulation declared",
    status: "passed",
    validation: "COL-CML-007",
    upstreamRef: "COL-SIM-007",
    required: true,
    description: "Workspace compliance — inventory catalog rules",
  },
  {
    id: "COL-CMP-008",
    kind: "boundary",
    purpose: "Verify declarative-only boundary compliance without runtime execution",
    rule: "no-runtime-execution-must-be-declared",
    auditPoint: "declarative:no-runtime-execution",
    waiverCondition: "boundary-exception-not-permitted",
    inputs: ["COL-INP-008"],
    outputs: ["COL-OUT-008"],
    criteria: ["declarative-only", "rollback-preview-declared"],
    evidence: "COL-SIM-008 boundary simulation declared",
    status: "passed",
    validation: "COL-CML-008",
    upstreamRef: "COL-SIM-008",
    required: true,
    description: "Boundary compliance — no runtime execution rules",
  },
];

export const COLLABORATION_COMPLIANCE_VALIDATION_CATALOG: CollaborationComplianceValidation[] = [
  {
    id: "COL-CML-001",
    complianceRef: "COL-CMP-001",
    validationKind: "shared",
    passCondition: "shared-compliance-verified",
    required: true,
    description: "Shared compliance validation — rules verified",
  },
  {
    id: "COL-CML-002",
    complianceRef: "COL-CMP-002",
    validationKind: "topology",
    passCondition: "topology-compliance-verified",
    required: true,
    description: "Topology compliance validation — rules verified",
  },
  {
    id: "COL-CML-003",
    complianceRef: "COL-CMP-003",
    validationKind: "communication",
    passCondition: "communication-compliance-verified",
    required: true,
    description: "Communication compliance validation — rules verified",
  },
  {
    id: "COL-CML-004",
    complianceRef: "COL-CMP-004",
    validationKind: "delegation",
    passCondition: "delegation-compliance-verified",
    required: true,
    description: "Delegation compliance validation — rules verified",
  },
  {
    id: "COL-CML-005",
    complianceRef: "COL-CMP-005",
    validationKind: "coordination",
    passCondition: "coordination-compliance-verified",
    required: true,
    description: "Coordination compliance validation — rules verified",
  },
  {
    id: "COL-CML-006",
    complianceRef: "COL-CMP-006",
    validationKind: "governance",
    passCondition: "governance-compliance-verified",
    required: true,
    description: "Governance compliance validation — rules verified",
  },
  {
    id: "COL-CML-007",
    complianceRef: "COL-CMP-007",
    validationKind: "workspace",
    passCondition: "workspace-compliance-verified",
    required: true,
    description: "Workspace compliance validation — rules verified",
  },
  {
    id: "COL-CML-008",
    complianceRef: "COL-CMP-008",
    validationKind: "boundary",
    passCondition: "boundary-compliance-verified",
    required: true,
    description: "Boundary compliance validation — no-runtime verified",
  },
];

function upstreamRefExists(ref: string): boolean {
  const policyIds = new Set(COLLABORATION_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const constraintIds = new Set(COLLABORATION_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const contextIds = new Set(COLLABORATION_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const evaluationIds = new Set(COLLABORATION_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const simulationIds = new Set(COLLABORATION_SIMULATION_CATALOG_ENTRIES.map((s) => s.id));
  const sourceIds = new Set([
    "COL-SRC-001",
    "COL-SRC-002",
    "COL-SRC-003",
    "COL-SRC-004",
    "COL-SRC-005",
    "COL-SRC-006",
    "COL-SRC-007",
    "COL-SRC-008",
  ]);

  return (
    policyIds.has(ref) ||
    constraintIds.has(ref) ||
    contextIds.has(ref) ||
    evaluationIds.has(ref) ||
    simulationIds.has(ref) ||
    sourceIds.has(ref)
  );
}

function requiredItemsPassed(): boolean {
  return COLLABORATION_COMPLIANCE_CATALOG_ENTRIES.filter((i) => i.required).every(
    (i) => i.status === "passed" || i.status === "waived",
  );
}

export function isCollaborationComplianceCatalogRefsAligned(): boolean {
  const inputIds = new Set(COLLABORATION_INPUT_CATALOG.map((i) => i.id));
  const outputIds = new Set(COLLABORATION_OUTPUT_CATALOG.map((o) => o.id));
  const validationIds = new Set(COLLABORATION_COMPLIANCE_VALIDATION_CATALOG.map((v) => v.id));
  const complianceIds = new Set(COLLABORATION_COMPLIANCE_CATALOG_ENTRIES.map((c) => c.id));
  const kinds = new Set(COLLABORATION_COMPLIANCE_CATALOG_ENTRIES.map((c) => c.kind));

  const itemsAligned = COLLABORATION_COMPLIANCE_CATALOG_ENTRIES.every(
    (c) =>
      upstreamRefExists(c.upstreamRef) &&
      validationIds.has(c.validation) &&
      c.inputs.every((i) => inputIds.has(i)) &&
      c.outputs.every((o) => outputIds.has(o)) &&
      c.criteria.length >= 1 &&
      c.evidence.length > 0 &&
      c.rule.length > 0 &&
      c.auditPoint.length > 0 &&
      c.waiverCondition.length > 0,
  );

  const validationsAligned = COLLABORATION_COMPLIANCE_VALIDATION_CATALOG.every((v) =>
    complianceIds.has(v.complianceRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    itemsAligned &&
    validationsAligned &&
    kindsComplete &&
    COLLABORATION_COMPLIANCE_CATALOG_ENTRIES.length === 8 &&
    requiredItemsPassed()
  );
}

export function buildCollaborationComplianceCatalogManifest(): CollaborationComplianceCatalogManifest {
  const items = COLLABORATION_COMPLIANCE_CATALOG_ENTRIES;
  const kinds = new Set(items.map((c) => c.kind));
  const catalogComplete =
    items.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k)) && requiredItemsPassed();

  return {
    version: V76_COLLABORATION_COMPLIANCE_VERSION,
    entryCount: items.length,
    kindCount: kinds.size,
    catalogComplete,
    items,
    summary: [
      `collaboration-compliance-catalog count=${items.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildCollaborationComplianceValidationManifest(): CollaborationComplianceValidationManifest {
  const validations = COLLABORATION_COMPLIANCE_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V76_COLLABORATION_COMPLIANCE_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `collaboration-compliance-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getCollaborationComplianceCatalogEntryById(
  id: string,
): CollaborationComplianceCatalogEntry | undefined {
  return COLLABORATION_COMPLIANCE_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getCollaborationComplianceCatalogEntriesByKind(
  kind: CollaborationComplianceKind,
): CollaborationComplianceCatalogEntry[] {
  return COLLABORATION_COMPLIANCE_CATALOG_ENTRIES.filter((c) => c.kind === kind);
}

export function getCollaborationComplianceValidationByComplianceRef(
  complianceRef: string,
): CollaborationComplianceValidation | undefined {
  return COLLABORATION_COMPLIANCE_VALIDATION_CATALOG.find((v) => v.complianceRef === complianceRef);
}

export function computeCollaborationDeclarativeCompliancePass(input: {
  status: CollaborationComplianceCatalogEntry["status"];
  required: boolean;
}): boolean {
  if (!input.required) return true;
  return input.status === "passed" || input.status === "waived";
}
