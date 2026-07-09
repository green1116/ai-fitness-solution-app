/**
 * V79 P7 — Task compliance catalog (declarative)
 */
import { TASK_CONSTRAINT_CATALOG_ENTRIES } from "./task.constraint.catalog";
import { TASK_CONTEXT_CATALOG_ENTRIES } from "./task.context.catalog";
import { TASK_EVALUATION_CATALOG_ENTRIES } from "./task.evaluation.catalog";
import { TASK_UPSTREAM_DEPENDENCIES } from "./task.dependencies";
import { TASK_ROLE_CATALOG, TASK_TOPOLOGY_CATALOG } from "./task.inventory";
import { TASK_POLICY_CATALOG_ENTRIES } from "./task.policy.catalog";
import { TASK_SIMULATION_CATALOG_ENTRIES } from "./task.simulation.catalog";
import { TASK_STATE_CATALOG } from "./task.state";
import type {
  TaskComplianceCatalogEntry,
  TaskComplianceCatalogManifest,
  TaskComplianceKind,
  TaskComplianceValidation,
  TaskComplianceValidationManifest,
} from "./task.compliance";
import { V79_TASK_COMPLIANCE_VERSION } from "./task.compliance";

const REQUIRED_KINDS: TaskComplianceKind[] = [
  "shared",
  "role",
  "state",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
];

export const TASK_COMPLIANCE_CATALOG_ENTRIES: TaskComplianceCatalogEntry[] = [
  {
    id: "TSK-CMP-001",
    kind: "shared",
    purpose: "Verify shared task baseline compliance rules",
    rule: "upstream-execution-freeze-must-remain-intact",
    auditPoint: "verify:v79-p6-task-simulation-catalog",
    waiverCondition: "governance-approved-shared-exception",
    roleRef: "TSK-ROL-001",
    stateRef: "TSK-STA-001",
    topologyRef: "TSK-TOP-001",
    dependencyRef: "TSK-DEP-001",
    criteria: ["freeze-intact", "shared-rules-documented"],
    evidence: "TSK-SIM-001 shared simulation declared",
    status: "passed",
    validation: "TSK-CML-001",
    upstreamRef: "TSK-SIM-001",
    required: true,
    description: "Shared compliance — baseline freeze rules",
  },
  {
    id: "TSK-CMP-002",
    kind: "role",
    purpose: "Verify task role assignment compliance rules",
    rule: "task-role-must-be-defined",
    auditPoint: "verify:v79-p4-task-constraint-catalog",
    waiverCondition: "role-exception-governance-approved",
    roleRef: "TSK-ROL-002",
    stateRef: "TSK-STA-002",
    topologyRef: "TSK-TOP-002",
    dependencyRef: "TSK-DEP-002",
    criteria: ["role-defined", "role-rules-documented"],
    evidence: "TSK-SIM-002 role simulation declared",
    status: "passed",
    validation: "TSK-CML-002",
    upstreamRef: "TSK-SIM-002",
    required: true,
    description: "Role compliance — assignment completeness rules",
  },
  {
    id: "TSK-CMP-003",
    kind: "state",
    purpose: "Verify task lifecycle state compliance rules",
    rule: "task-state-must-be-documented",
    auditPoint: "verify:v79-p4-task-constraint-catalog",
    waiverCondition: "state-exception-governance-approved",
    roleRef: "TSK-ROL-003",
    stateRef: "TSK-STA-004",
    topologyRef: "TSK-TOP-003",
    dependencyRef: "TSK-DEP-003",
    criteria: ["state-documented", "state-rules-documented"],
    evidence: "TSK-SIM-003 state simulation declared",
    status: "passed",
    validation: "TSK-CML-003",
    upstreamRef: "TSK-SIM-003",
    required: true,
    description: "State compliance — lifecycle state rules",
  },
  {
    id: "TSK-CMP-004",
    kind: "topology",
    purpose: "Verify topology acyclicity compliance rules",
    rule: "topology-graph-must-be-acyclic",
    auditPoint: "verify:v79-p4-task-constraint-catalog",
    waiverCondition: "topology-exception-not-permitted",
    roleRef: "TSK-ROL-002",
    stateRef: "TSK-STA-003",
    topologyRef: "TSK-TOP-002",
    dependencyRef: "TSK-DEP-004",
    criteria: ["acyclic-verified", "topology-rules-documented"],
    evidence: "TSK-SIM-004 topology simulation declared",
    status: "passed",
    validation: "TSK-CML-004",
    upstreamRef: "TSK-SIM-004",
    required: true,
    description: "Topology compliance — acyclic graph rules",
  },
  {
    id: "TSK-CMP-005",
    kind: "scope",
    purpose: "Verify task scope boundary compliance rules",
    rule: "task-scope-must-be-bounded",
    auditPoint: "verify:v79-p5-task-evaluation-catalog",
    waiverCondition: "scope-waiver-with-audit-trail",
    roleRef: "TSK-ROL-005",
    stateRef: "TSK-STA-006",
    topologyRef: "TSK-TOP-005",
    dependencyRef: "TSK-DEP-006",
    criteria: ["scope-bounded", "scope-rules-documented"],
    evidence: "TSK-SIM-005 scope simulation declared",
    status: "passed",
    validation: "TSK-CML-005",
    upstreamRef: "TSK-SIM-005",
    required: true,
    description: "Scope compliance — boundary completeness rules",
  },
  {
    id: "TSK-CMP-006",
    kind: "dependency",
    purpose: "Verify upstream dependency lock compliance rules",
    rule: "upstream-dependency-must-be-intact",
    auditPoint: "verify:v79-p5-task-evaluation-catalog",
    waiverCondition: "dependency-exception-governance-approved",
    roleRef: "TSK-ROL-004",
    stateRef: "TSK-STA-005",
    topologyRef: "TSK-TOP-004",
    dependencyRef: "TSK-DEP-005",
    criteria: ["dependency-intact", "dependency-rules-documented"],
    evidence: "TSK-SIM-006 dependency simulation declared",
    status: "passed",
    validation: "TSK-CML-006",
    upstreamRef: "TSK-SIM-006",
    required: true,
    description: "Dependency compliance — upstream lock rules",
  },
  {
    id: "TSK-CMP-007",
    kind: "governance",
    purpose: "Verify governance rules compliance",
    rule: "governance-rules-must-be-documented",
    auditPoint: "verify:v79-p2-task-policy-catalog",
    waiverCondition: "governance-deferral-with-expiry",
    roleRef: "TSK-ROL-007",
    stateRef: "TSK-STA-007",
    topologyRef: "TSK-TOP-007",
    dependencyRef: "TSK-DEP-002",
    criteria: ["rules-documented", "governance-rules-documented"],
    evidence: "TSK-SIM-007 governance simulation declared",
    status: "passed",
    validation: "TSK-CML-007",
    upstreamRef: "TSK-SIM-007",
    required: true,
    description: "Governance compliance — rules completeness rules",
  },
  {
    id: "TSK-CMP-008",
    kind: "boundary",
    purpose: "Verify declarative-only boundary compliance without runtime task engine",
    rule: "no-runtime-task-engine-must-be-declared",
    auditPoint: "declarative:no-runtime-task-engine",
    waiverCondition: "boundary-exception-not-permitted",
    roleRef: "TSK-ROL-008",
    stateRef: "TSK-STA-008",
    topologyRef: "TSK-TOP-008",
    dependencyRef: "TSK-DEP-008",
    criteria: ["declarative-only", "rollback-preview-declared"],
    evidence: "TSK-SIM-008 boundary simulation declared",
    status: "passed",
    validation: "TSK-CML-008",
    upstreamRef: "TSK-SIM-008",
    required: true,
    description: "Boundary compliance — no runtime task engine rules",
  },
];

export const TASK_COMPLIANCE_VALIDATION_CATALOG: TaskComplianceValidation[] = [
  {
    id: "TSK-CML-001",
    complianceRef: "TSK-CMP-001",
    validationKind: "shared",
    passCondition: "shared-compliance-verified",
    required: true,
    description: "Shared compliance validation — rules verified",
  },
  {
    id: "TSK-CML-002",
    complianceRef: "TSK-CMP-002",
    validationKind: "role",
    passCondition: "role-compliance-verified",
    required: true,
    description: "Role compliance validation — rules verified",
  },
  {
    id: "TSK-CML-003",
    complianceRef: "TSK-CMP-003",
    validationKind: "state",
    passCondition: "state-compliance-verified",
    required: true,
    description: "State compliance validation — rules verified",
  },
  {
    id: "TSK-CML-004",
    complianceRef: "TSK-CMP-004",
    validationKind: "topology",
    passCondition: "topology-compliance-verified",
    required: true,
    description: "Topology compliance validation — rules verified",
  },
  {
    id: "TSK-CML-005",
    complianceRef: "TSK-CMP-005",
    validationKind: "scope",
    passCondition: "scope-compliance-verified",
    required: true,
    description: "Scope compliance validation — rules verified",
  },
  {
    id: "TSK-CML-006",
    complianceRef: "TSK-CMP-006",
    validationKind: "dependency",
    passCondition: "dependency-compliance-verified",
    required: true,
    description: "Dependency compliance validation — rules verified",
  },
  {
    id: "TSK-CML-007",
    complianceRef: "TSK-CMP-007",
    validationKind: "governance",
    passCondition: "governance-compliance-verified",
    required: true,
    description: "Governance compliance validation — rules verified",
  },
  {
    id: "TSK-CML-008",
    complianceRef: "TSK-CMP-008",
    validationKind: "boundary",
    passCondition: "boundary-compliance-verified",
    required: true,
    description: "Boundary compliance validation — no-runtime verified",
  },
];

function upstreamRefExists(ref: string): boolean {
  const policyIds = new Set(TASK_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const constraintIds = new Set(TASK_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const contextIds = new Set(TASK_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const evaluationIds = new Set(TASK_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const simulationIds = new Set(TASK_SIMULATION_CATALOG_ENTRIES.map((s) => s.id));

  return (
    policyIds.has(ref) ||
    constraintIds.has(ref) ||
    contextIds.has(ref) ||
    evaluationIds.has(ref) ||
    simulationIds.has(ref)
  );
}

function requiredItemsPassed(): boolean {
  return TASK_COMPLIANCE_CATALOG_ENTRIES.filter((i) => i.required).every(
    (i) => i.status === "passed" || i.status === "waived",
  );
}

export function isTaskComplianceCatalogRefsAligned(): boolean {
  const roleIds = new Set(TASK_ROLE_CATALOG.map((r) => r.id));
  const stateIds = new Set(TASK_STATE_CATALOG.map((s) => s.id));
  const topologyIds = new Set(TASK_TOPOLOGY_CATALOG.map((t) => t.id));
  const depIds = new Set(TASK_UPSTREAM_DEPENDENCIES.map((d) => d.id));
  const validationIds = new Set(TASK_COMPLIANCE_VALIDATION_CATALOG.map((v) => v.id));
  const complianceIds = new Set(TASK_COMPLIANCE_CATALOG_ENTRIES.map((c) => c.id));
  const kinds = new Set(TASK_COMPLIANCE_CATALOG_ENTRIES.map((c) => c.kind));

  const itemsAligned = TASK_COMPLIANCE_CATALOG_ENTRIES.every(
    (c) =>
      upstreamRefExists(c.upstreamRef) &&
      validationIds.has(c.validation) &&
      roleIds.has(c.roleRef) &&
      stateIds.has(c.stateRef) &&
      topologyIds.has(c.topologyRef) &&
      depIds.has(c.dependencyRef) &&
      c.criteria.length >= 1 &&
      c.evidence.length > 0 &&
      c.rule.length > 0 &&
      c.auditPoint.length > 0 &&
      c.waiverCondition.length > 0,
  );

  const validationsAligned = TASK_COMPLIANCE_VALIDATION_CATALOG.every((v) =>
    complianceIds.has(v.complianceRef),
  );

  const kindsComplete = REQUIRED_KINDS.every((k) => kinds.has(k));

  return (
    itemsAligned &&
    validationsAligned &&
    kindsComplete &&
    TASK_COMPLIANCE_CATALOG_ENTRIES.length === 8 &&
    requiredItemsPassed()
  );
}

export function buildTaskComplianceCatalogManifest(): TaskComplianceCatalogManifest {
  const items = TASK_COMPLIANCE_CATALOG_ENTRIES;
  const kinds = new Set(items.map((c) => c.kind));
  const catalogComplete =
    items.length === 8 && REQUIRED_KINDS.every((k) => kinds.has(k)) && requiredItemsPassed();

  return {
    version: V79_TASK_COMPLIANCE_VERSION,
    entryCount: items.length,
    kindCount: kinds.size,
    catalogComplete,
    items,
    summary: [
      `task-compliance-catalog count=${items.length}`,
      `kinds=${kinds.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildTaskComplianceValidationManifest(): TaskComplianceValidationManifest {
  const validations = TASK_COMPLIANCE_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V79_TASK_COMPLIANCE_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `task-compliance-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getTaskComplianceCatalogEntryById(
  id: string,
): TaskComplianceCatalogEntry | undefined {
  return TASK_COMPLIANCE_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getTaskComplianceCatalogEntriesByKind(
  kind: TaskComplianceKind,
): TaskComplianceCatalogEntry[] {
  return TASK_COMPLIANCE_CATALOG_ENTRIES.filter((c) => c.kind === kind);
}

export function getTaskComplianceValidationByComplianceRef(
  complianceRef: string,
): TaskComplianceValidation | undefined {
  return TASK_COMPLIANCE_VALIDATION_CATALOG.find((v) => v.complianceRef === complianceRef);
}

export function computeTaskDeclarativeCompliancePass(input: {
  status: TaskComplianceCatalogEntry["status"];
  required: boolean;
}): boolean {
  if (!input.required) return true;
  return input.status === "passed" || input.status === "waived";
}
