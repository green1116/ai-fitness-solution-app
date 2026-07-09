/**
 * V78 P7 — Execution compliance catalog (declarative)
 */
import { EXECUTION_CONSTRAINT_CATALOG_ENTRIES } from "./execution.constraint.catalog";
import { EXECUTION_CONTEXT_CATALOG_ENTRIES } from "./execution.context.catalog";
import { EXECUTION_EVALUATION_CATALOG_ENTRIES } from "./execution.evaluation.catalog";
import { EXECUTION_UPSTREAM_DEPENDENCIES } from "./execution.dependencies";
import {
  EXECUTION_ROLE_CATALOG,
  EXECUTION_TOPOLOGY_CATALOG,
} from "./execution.inventory";
import { EXECUTION_POLICY_CATALOG_ENTRIES } from "./execution.policy.catalog";
import { EXECUTION_SIMULATION_CATALOG_ENTRIES } from "./execution.simulation.catalog";
import type {
  ExecutionComplianceCatalogEntry,
  ExecutionComplianceCatalogManifest,
  ExecutionComplianceKind,
  ExecutionComplianceValidation,
  ExecutionComplianceValidationManifest,
} from "./execution.compliance";
import { V78_EXECUTION_COMPLIANCE_VERSION } from "./execution.compliance";

const REQUIRED_KINDS: ExecutionComplianceKind[] = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
];

export const EXECUTION_COMPLIANCE_CATALOG_ENTRIES: ExecutionComplianceCatalogEntry[] = [
  {
    id: "EXE-CMP-001",
    kind: "shared",
    purpose: "Verify shared execution baseline compliance rules",
    rule: "upstream-planning-freeze-must-remain-intact",
    auditPoint: "verify:v78-p6-execution-simulation-catalog",
    waiverCondition: "governance-approved-shared-exception",
    roleRef: "EXE-ROL-001",
    topologyRef: "EXE-TOP-001",
    dependencyRef: "EXE-DEP-001",
    criteria: ["freeze-intact", "shared-rules-documented"],
    evidence: "EXE-SIM-001 shared simulation declared",
    status: "passed",
    validation: "EXE-CML-001",
    upstreamRef: "EXE-SIM-001",
    required: true,
    description: "Shared compliance — baseline freeze rules",
  },
  {
    id: "EXE-CMP-002",
    kind: "role",
    purpose: "Verify execution role assignment compliance rules",
    rule: "execution-role-must-be-defined",
    auditPoint: "verify:v78-p4-execution-constraint-catalog",
    waiverCondition: "role-exception-governance-approved",
    roleRef: "EXE-ROL-002",
    topologyRef: "EXE-TOP-002",
    dependencyRef: "EXE-DEP-002",
    criteria: ["role-defined", "role-rules-documented"],
    evidence: "EXE-SIM-002 role simulation declared",
    status: "passed",
    validation: "EXE-CML-002",
    upstreamRef: "EXE-SIM-002",
    required: true,
    description: "Role compliance — assignment completeness rules",
  },
  {
    id: "EXE-CMP-003",
    kind: "topology",
    purpose: "Verify topology acyclicity compliance rules",
    rule: "topology-graph-must-be-acyclic",
    auditPoint: "verify:v78-p4-execution-constraint-catalog",
    waiverCondition: "topology-exception-not-permitted",
    roleRef: "EXE-ROL-002",
    topologyRef: "EXE-TOP-002",
    dependencyRef: "EXE-DEP-003",
    criteria: ["acyclic-verified", "topology-rules-documented"],
    evidence: "EXE-SIM-003 topology simulation declared",
    status: "passed",
    validation: "EXE-CML-003",
    upstreamRef: "EXE-SIM-003",
    required: true,
    description: "Topology compliance — acyclic graph rules",
  },
  {
    id: "EXE-CMP-004",
    kind: "scope",
    purpose: "Verify execution scope boundary compliance rules",
    rule: "execution-scope-must-be-bounded",
    auditPoint: "verify:v78-p5-execution-evaluation-catalog",
    waiverCondition: "scope-waiver-with-audit-trail",
    roleRef: "EXE-ROL-003",
    topologyRef: "EXE-TOP-003",
    dependencyRef: "EXE-DEP-006",
    criteria: ["scope-bounded", "scope-rules-documented"],
    evidence: "EXE-SIM-004 scope simulation declared",
    status: "passed",
    validation: "EXE-CML-004",
    upstreamRef: "EXE-SIM-004",
    required: true,
    description: "Scope compliance — boundary completeness rules",
  },
  {
    id: "EXE-CMP-005",
    kind: "dependency",
    purpose: "Verify upstream dependency lock compliance rules",
    rule: "upstream-dependency-must-be-intact",
    auditPoint: "verify:v78-p5-execution-evaluation-catalog",
    waiverCondition: "dependency-exception-governance-approved",
    roleRef: "EXE-ROL-004",
    topologyRef: "EXE-TOP-004",
    dependencyRef: "EXE-DEP-005",
    criteria: ["dependency-intact", "dependency-rules-documented"],
    evidence: "EXE-SIM-005 dependency simulation declared",
    status: "passed",
    validation: "EXE-CML-005",
    upstreamRef: "EXE-SIM-005",
    required: true,
    description: "Dependency compliance — upstream lock rules",
  },
  {
    id: "EXE-CMP-006",
    kind: "governance",
    purpose: "Verify governance rules compliance",
    rule: "governance-rules-must-be-documented",
    auditPoint: "verify:v78-p2-execution-policy-catalog",
    waiverCondition: "governance-deferral-with-expiry",
    roleRef: "EXE-ROL-007",
    topologyRef: "EXE-TOP-007",
    dependencyRef: "EXE-DEP-004",
    criteria: ["rules-documented", "governance-rules-documented"],
    evidence: "EXE-SIM-006 governance simulation declared",
    status: "passed",
    validation: "EXE-CML-006",
    upstreamRef: "EXE-SIM-006",
    required: true,
    description: "Governance compliance — rules completeness rules",
  },
  {
    id: "EXE-CMP-007",
    kind: "workspace",
    purpose: "Verify workspace inventory catalog compliance rules",
    rule: "inventory-catalog-must-be-complete",
    auditPoint: "verify:v78-p1-execution-inventory",
    waiverCondition: "workspace-waiver-governance-approved",
    roleRef: "EXE-ROL-006",
    topologyRef: "EXE-TOP-006",
    dependencyRef: "EXE-DEP-008",
    criteria: ["catalog-complete", "workspace-rules-documented"],
    evidence: "EXE-SIM-007 workspace simulation declared",
    status: "passed",
    validation: "EXE-CML-007",
    upstreamRef: "EXE-SIM-007",
    required: true,
    description: "Workspace compliance — inventory catalog rules",
  },
  {
    id: "EXE-CMP-008",
    kind: "boundary",
    purpose: "Verify declarative-only boundary compliance without runtime execution",
    rule: "no-runtime-execution-must-be-declared",
    auditPoint: "declarative:no-runtime-execution",
    waiverCondition: "boundary-exception-not-permitted",
    roleRef: "EXE-ROL-008",
    topologyRef: "EXE-TOP-008",
    dependencyRef: "EXE-DEP-008",
    criteria: ["declarative-only", "rollback-preview-declared"],
    evidence: "EXE-SIM-008 boundary simulation declared",
    status: "passed",
    validation: "EXE-CML-008",
    upstreamRef: "EXE-SIM-008",
    required: true,
    description: "Boundary compliance — no runtime execution rules",
  },
];

export const EXECUTION_COMPLIANCE_VALIDATION_CATALOG: ExecutionComplianceValidation[] = [
  {
    id: "EXE-CML-001",
    complianceRef: "EXE-CMP-001",
    validationKind: "shared",
    passCondition: "shared-compliance-verified",
    required: true,
    description: "Shared compliance validation — rules verified",
  },
  {
    id: "EXE-CML-002",
    complianceRef: "EXE-CMP-002",
    validationKind: "role",
    passCondition: "role-compliance-verified",
    required: true,
    description: "Role compliance validation — rules verified",
  },
  {
    id: "EXE-CML-003",
    complianceRef: "EXE-CMP-003",
    validationKind: "topology",
    passCondition: "topology-compliance-verified",
    required: true,
    description: "Topology compliance validation — rules verified",
  },
  {
    id: "EXE-CML-004",
    complianceRef: "EXE-CMP-004",
    validationKind: "scope",
    passCondition: "scope-compliance-verified",
    required: true,
    description: "Scope compliance validation — rules verified",
  },
  {
    id: "EXE-CML-005",
    complianceRef: "EXE-CMP-005",
    validationKind: "dependency",
    passCondition: "dependency-compliance-verified",
    required: true,
    description: "Dependency compliance validation — rules verified",
  },
  {
    id: "EXE-CML-006",
    complianceRef: "EXE-CMP-006",
    validationKind: "governance",
    passCondition: "governance-compliance-verified",
    required: true,
    description: "Governance compliance validation — rules verified",
  },
  {
    id: "EXE-CML-007",
    complianceRef: "EXE-CMP-007",
    validationKind: "workspace",
    passCondition: "workspace-compliance-verified",
    required: true,
    description: "Workspace compliance validation — rules verified",
  },
  {
    id: "EXE-CML-008",
    complianceRef: "EXE-CMP-008",
    validationKind: "boundary",
    passCondition: "boundary-compliance-verified",
    required: true,
    description: "Boundary compliance validation — no-runtime verified",
  },
];

function upstreamRefExists(ref: string): boolean {
  const policyIds = new Set(EXECUTION_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const constraintIds = new Set(EXECUTION_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const contextIds = new Set(EXECUTION_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const evaluationIds = new Set(EXECUTION_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const simulationIds = new Set(EXECUTION_SIMULATION_CATALOG_ENTRIES.map((s) => s.id));

  return (
    policyIds.has(ref) ||
    constraintIds.has(ref) ||
    contextIds.has(ref) ||
    evaluationIds.has(ref) ||
    simulationIds.has(ref)
  );
}

function requiredItemsPassed(): boolean {
  return EXECUTION_COMPLIANCE_CATALOG_ENTRIES.filter((i) => i.required).every(
    (i) => i.status === "passed" || i.status === "waived",
  );
}

export function isExecutionComplianceCatalogRefsAligned(): boolean {
  const roleIds = new Set(EXECUTION_ROLE_CATALOG.map((r) => r.id));
  const topologyIds = new Set(EXECUTION_TOPOLOGY_CATALOG.map((t) => t.id));
  const depIds = new Set(EXECUTION_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const validationIds = new Set(EXECUTION_COMPLIANCE_VALIDATION_CATALOG.map((v) => v.id));
  const complianceIds = new Set(EXECUTION_COMPLIANCE_CATALOG_ENTRIES.map((c) => c.id));
  const kinds = new Set(EXECUTION_COMPLIANCE_CATALOG_ENTRIES.map((c) => c.kind));

  const itemsAligned = EXECUTION_COMPLIANCE_CATALOG_ENTRIES.every(
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

  const validationsAligned = EXECUTION_COMPLIANCE_VALIDATION_CATALOG.every((v) =>
    complianceIds.has(v.complianceRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    itemsAligned &&
    validationsAligned &&
    kindsComplete &&
    EXECUTION_COMPLIANCE_CATALOG_ENTRIES.length === 8 &&
    requiredItemsPassed()
  );
}

export function buildExecutionComplianceCatalogManifest(): ExecutionComplianceCatalogManifest {
  const items = EXECUTION_COMPLIANCE_CATALOG_ENTRIES;
  const kinds = new Set(items.map((c) => c.kind));
  const catalogComplete =
    items.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k)) && requiredItemsPassed();

  return {
    version: V78_EXECUTION_COMPLIANCE_VERSION,
    entryCount: items.length,
    kindCount: kinds.size,
    catalogComplete,
    items,
    summary: [
      `execution-compliance-catalog count=${items.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildExecutionComplianceValidationManifest(): ExecutionComplianceValidationManifest {
  const validations = EXECUTION_COMPLIANCE_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V78_EXECUTION_COMPLIANCE_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `execution-compliance-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getExecutionComplianceCatalogEntryById(
  id: string,
): ExecutionComplianceCatalogEntry | undefined {
  return EXECUTION_COMPLIANCE_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getExecutionComplianceCatalogEntriesByKind(
  kind: ExecutionComplianceKind,
): ExecutionComplianceCatalogEntry[] {
  return EXECUTION_COMPLIANCE_CATALOG_ENTRIES.filter((c) => c.kind === kind);
}

export function getExecutionComplianceValidationByComplianceRef(
  complianceRef: string,
): ExecutionComplianceValidation | undefined {
  return EXECUTION_COMPLIANCE_VALIDATION_CATALOG.find((v) => v.complianceRef === complianceRef);
}

export function computeExecutionDeclarativeCompliancePass(input: {
  status: ExecutionComplianceCatalogEntry["status"];
  required: boolean;
}): boolean {
  if (!input.required) return true;
  return input.status === "passed" || input.status === "waived";
}
