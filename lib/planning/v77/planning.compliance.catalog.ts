/**
 * V77 P7 — Planning compliance catalog (declarative)
 */
import { PLANNING_CONSTRAINT_CATALOG_ENTRIES } from "./planning.constraint.catalog";
import { PLANNING_CONTEXT_CATALOG_ENTRIES } from "./planning.context.catalog";
import { PLANNING_EVALUATION_CATALOG_ENTRIES } from "./planning.evaluation.catalog";
import { PLANNING_UPSTREAM_DEPENDENCIES } from "./planning.dependencies";
import {
  PLANNING_ROLE_CATALOG,
  PLANNING_TOPOLOGY_CATALOG,
} from "./planning.inventory";
import { PLANNING_POLICY_CATALOG_ENTRIES } from "./planning.policy.catalog";
import { PLANNING_SIMULATION_CATALOG_ENTRIES } from "./planning.simulation.catalog";
import type {
  PlanningComplianceCatalogEntry,
  PlanningComplianceCatalogManifest,
  PlanningComplianceKind,
  PlanningComplianceValidation,
  PlanningComplianceValidationManifest,
} from "./planning.compliance";
import { V77_PLANNING_COMPLIANCE_VERSION } from "./planning.compliance";

const REQUIRED_KINDS: PlanningComplianceKind[] = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
];

export const PLANNING_COMPLIANCE_CATALOG_ENTRIES: PlanningComplianceCatalogEntry[] = [
  {
    id: "PLN-CMP-001",
    kind: "shared",
    purpose: "Verify shared planning baseline compliance rules",
    rule: "upstream-collaboration-freeze-must-remain-intact",
    auditPoint: "verify:v77-p6-planning-simulation-catalog",
    waiverCondition: "governance-approved-shared-exception",
    roleRef: "PLN-ROL-001",
    topologyRef: "PLN-TOP-001",
    dependencyRef: "PLN-DEP-001",
    criteria: ["freeze-intact", "shared-rules-documented"],
    evidence: "PLN-SIM-001 shared simulation declared",
    status: "passed",
    validation: "PLN-CML-001",
    upstreamRef: "PLN-SIM-001",
    required: true,
    description: "Shared compliance — baseline freeze rules",
  },
  {
    id: "PLN-CMP-002",
    kind: "role",
    purpose: "Verify planning role assignment compliance rules",
    rule: "planning-role-must-be-defined",
    auditPoint: "verify:v77-p4-planning-constraint-catalog",
    waiverCondition: "role-exception-governance-approved",
    roleRef: "PLN-ROL-002",
    topologyRef: "PLN-TOP-002",
    dependencyRef: "PLN-DEP-002",
    criteria: ["role-defined", "role-rules-documented"],
    evidence: "PLN-SIM-002 role simulation declared",
    status: "passed",
    validation: "PLN-CML-002",
    upstreamRef: "PLN-SIM-002",
    required: true,
    description: "Role compliance — assignment completeness rules",
  },
  {
    id: "PLN-CMP-003",
    kind: "topology",
    purpose: "Verify topology acyclicity compliance rules",
    rule: "topology-graph-must-be-acyclic",
    auditPoint: "verify:v77-p4-planning-constraint-catalog",
    waiverCondition: "topology-exception-not-permitted",
    roleRef: "PLN-ROL-002",
    topologyRef: "PLN-TOP-002",
    dependencyRef: "PLN-DEP-003",
    criteria: ["acyclic-verified", "topology-rules-documented"],
    evidence: "PLN-SIM-003 topology simulation declared",
    status: "passed",
    validation: "PLN-CML-003",
    upstreamRef: "PLN-SIM-003",
    required: true,
    description: "Topology compliance — acyclic graph rules",
  },
  {
    id: "PLN-CMP-004",
    kind: "scope",
    purpose: "Verify planning scope boundary compliance rules",
    rule: "planning-scope-must-be-bounded",
    auditPoint: "verify:v77-p5-planning-evaluation-catalog",
    waiverCondition: "scope-waiver-with-audit-trail",
    roleRef: "PLN-ROL-005",
    topologyRef: "PLN-TOP-005",
    dependencyRef: "PLN-DEP-006",
    criteria: ["scope-bounded", "scope-rules-documented"],
    evidence: "PLN-SIM-004 scope simulation declared",
    status: "passed",
    validation: "PLN-CML-004",
    upstreamRef: "PLN-SIM-004",
    required: true,
    description: "Scope compliance — boundary completeness rules",
  },
  {
    id: "PLN-CMP-005",
    kind: "dependency",
    purpose: "Verify upstream dependency lock compliance rules",
    rule: "upstream-dependency-must-be-intact",
    auditPoint: "verify:v77-p5-planning-evaluation-catalog",
    waiverCondition: "dependency-exception-governance-approved",
    roleRef: "PLN-ROL-004",
    topologyRef: "PLN-TOP-004",
    dependencyRef: "PLN-DEP-005",
    criteria: ["dependency-intact", "dependency-rules-documented"],
    evidence: "PLN-SIM-005 dependency simulation declared",
    status: "passed",
    validation: "PLN-CML-005",
    upstreamRef: "PLN-SIM-005",
    required: true,
    description: "Dependency compliance — upstream lock rules",
  },
  {
    id: "PLN-CMP-006",
    kind: "governance",
    purpose: "Verify governance rules compliance",
    rule: "governance-rules-must-be-documented",
    auditPoint: "verify:v77-p2-planning-policy-catalog",
    waiverCondition: "governance-deferral-with-expiry",
    roleRef: "PLN-ROL-007",
    topologyRef: "PLN-TOP-007",
    dependencyRef: "PLN-DEP-004",
    criteria: ["rules-documented", "governance-rules-documented"],
    evidence: "PLN-SIM-006 governance simulation declared",
    status: "passed",
    validation: "PLN-CML-006",
    upstreamRef: "PLN-SIM-006",
    required: true,
    description: "Governance compliance — rules completeness rules",
  },
  {
    id: "PLN-CMP-007",
    kind: "workspace",
    purpose: "Verify workspace inventory catalog compliance rules",
    rule: "inventory-catalog-must-be-complete",
    auditPoint: "verify:v77-p1-planning-inventory",
    waiverCondition: "workspace-waiver-governance-approved",
    roleRef: "PLN-ROL-006",
    topologyRef: "PLN-TOP-006",
    dependencyRef: "PLN-DEP-008",
    criteria: ["catalog-complete", "workspace-rules-documented"],
    evidence: "PLN-SIM-007 workspace simulation declared",
    status: "passed",
    validation: "PLN-CML-007",
    upstreamRef: "PLN-SIM-007",
    required: true,
    description: "Workspace compliance — inventory catalog rules",
  },
  {
    id: "PLN-CMP-008",
    kind: "boundary",
    purpose: "Verify declarative-only boundary compliance without runtime planning",
    rule: "no-runtime-planning-must-be-declared",
    auditPoint: "declarative:no-runtime-planning",
    waiverCondition: "boundary-exception-not-permitted",
    roleRef: "PLN-ROL-008",
    topologyRef: "PLN-TOP-008",
    dependencyRef: "PLN-DEP-008",
    criteria: ["declarative-only", "rollback-preview-declared"],
    evidence: "PLN-SIM-008 boundary simulation declared",
    status: "passed",
    validation: "PLN-CML-008",
    upstreamRef: "PLN-SIM-008",
    required: true,
    description: "Boundary compliance — no runtime planning rules",
  },
];

export const PLANNING_COMPLIANCE_VALIDATION_CATALOG: PlanningComplianceValidation[] = [
  {
    id: "PLN-CML-001",
    complianceRef: "PLN-CMP-001",
    validationKind: "shared",
    passCondition: "shared-compliance-verified",
    required: true,
    description: "Shared compliance validation — rules verified",
  },
  {
    id: "PLN-CML-002",
    complianceRef: "PLN-CMP-002",
    validationKind: "role",
    passCondition: "role-compliance-verified",
    required: true,
    description: "Role compliance validation — rules verified",
  },
  {
    id: "PLN-CML-003",
    complianceRef: "PLN-CMP-003",
    validationKind: "topology",
    passCondition: "topology-compliance-verified",
    required: true,
    description: "Topology compliance validation — rules verified",
  },
  {
    id: "PLN-CML-004",
    complianceRef: "PLN-CMP-004",
    validationKind: "scope",
    passCondition: "scope-compliance-verified",
    required: true,
    description: "Scope compliance validation — rules verified",
  },
  {
    id: "PLN-CML-005",
    complianceRef: "PLN-CMP-005",
    validationKind: "dependency",
    passCondition: "dependency-compliance-verified",
    required: true,
    description: "Dependency compliance validation — rules verified",
  },
  {
    id: "PLN-CML-006",
    complianceRef: "PLN-CMP-006",
    validationKind: "governance",
    passCondition: "governance-compliance-verified",
    required: true,
    description: "Governance compliance validation — rules verified",
  },
  {
    id: "PLN-CML-007",
    complianceRef: "PLN-CMP-007",
    validationKind: "workspace",
    passCondition: "workspace-compliance-verified",
    required: true,
    description: "Workspace compliance validation — rules verified",
  },
  {
    id: "PLN-CML-008",
    complianceRef: "PLN-CMP-008",
    validationKind: "boundary",
    passCondition: "boundary-compliance-verified",
    required: true,
    description: "Boundary compliance validation — no-runtime verified",
  },
];

function upstreamRefExists(ref: string): boolean {
  const policyIds = new Set(PLANNING_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const constraintIds = new Set(PLANNING_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const contextIds = new Set(PLANNING_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const evaluationIds = new Set(PLANNING_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const simulationIds = new Set(PLANNING_SIMULATION_CATALOG_ENTRIES.map((s) => s.id));

  return (
    policyIds.has(ref) ||
    constraintIds.has(ref) ||
    contextIds.has(ref) ||
    evaluationIds.has(ref) ||
    simulationIds.has(ref)
  );
}

function requiredItemsPassed(): boolean {
  return PLANNING_COMPLIANCE_CATALOG_ENTRIES.filter((i) => i.required).every(
    (i) => i.status === "passed" || i.status === "waived",
  );
}

export function isPlanningComplianceCatalogRefsAligned(): boolean {
  const roleIds = new Set(PLANNING_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(PLANNING_TOPOLOGY_CATALOG.map((t) => t.id));
  const depIds = new Set(PLANNING_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const validationIds = new Set(PLANNING_COMPLIANCE_VALIDATION_CATALOG.map((v) => v.id));
  const complianceIds = new Set(PLANNING_COMPLIANCE_CATALOG_ENTRIES.map((c) => c.id));
  const kinds = new Set(PLANNING_COMPLIANCE_CATALOG_ENTRIES.map((c) => c.kind));

  const itemsAligned = PLANNING_COMPLIANCE_CATALOG_ENTRIES.every(
    (c) =>
      upstreamRefExists(c.upstreamRef) &&
      validationIds.has(c.validation) &&
      roleIds.has(c.roleRef) &&
      topologyIds.has(c.topologyRef) &&
      depIds.has(c.dependencyRef) &&
      c.criteria.length >= 1 &&
      c.evidence.length > 0 &&
      c.rule.length > 0 &&
      c.auditPoint.length > 0 &&
      c.waiverCondition.length > 0,
  );

  const validationsAligned = PLANNING_COMPLIANCE_VALIDATION_CATALOG.every((v) =>
    complianceIds.has(v.complianceRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    itemsAligned &&
    validationsAligned &&
    kindsComplete &&
    PLANNING_COMPLIANCE_CATALOG_ENTRIES.length === 8 &&
    requiredItemsPassed()
  );
}

export function buildPlanningComplianceCatalogManifest(): PlanningComplianceCatalogManifest {
  const items = PLANNING_COMPLIANCE_CATALOG_ENTRIES;
  const kinds = new Set(items.map((c) => c.kind));
  const catalogComplete =
    items.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k)) && requiredItemsPassed();

  return {
    version: V77_PLANNING_COMPLIANCE_VERSION,
    entryCount: items.length,
    kindCount: kinds.size,
    catalogComplete,
    items,
    summary: [
      `planning-compliance-catalog count=${items.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPlanningComplianceValidationManifest(): PlanningComplianceValidationManifest {
  const validations = PLANNING_COMPLIANCE_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V77_PLANNING_COMPLIANCE_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `planning-compliance-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getPlanningComplianceCatalogEntryById(
  id: string,
): PlanningComplianceCatalogEntry | undefined {
  return PLANNING_COMPLIANCE_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getPlanningComplianceCatalogEntriesByKind(
  kind: PlanningComplianceKind,
): PlanningComplianceCatalogEntry[] {
  return PLANNING_COMPLIANCE_CATALOG_ENTRIES.filter((c) => c.kind === kind);
}

export function getPlanningComplianceValidationByComplianceRef(
  complianceRef: string,
): PlanningComplianceValidation | undefined {
  return PLANNING_COMPLIANCE_VALIDATION_CATALOG.find((v) => v.complianceRef === complianceRef);
}

export function computePlanningDeclarativeCompliancePass(input: {
  status: PlanningComplianceCatalogEntry["status"];
  required: boolean;
}): boolean {
  if (!input.required) return true;
  return input.status === "passed" || input.status === "waived";
}
