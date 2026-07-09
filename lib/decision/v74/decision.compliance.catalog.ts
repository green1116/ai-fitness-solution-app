/**
 * V74 P7 — Decision compliance catalog (declarative)
 */
import { CONSTRAINT_CATALOG_ENTRIES } from "./decision.constraint.catalog";
import { CONTEXT_CATALOG_ENTRIES } from "./decision.context.catalog";
import { EVALUATION_CATALOG_ENTRIES } from "./decision.evaluation.catalog";
import { DECISION_INPUT_CATALOG, DECISION_OUTPUT_CATALOG } from "./decision.inventory";
import { POLICY_CATALOG_ENTRIES } from "./decision.policy.catalog";
import { SIMULATION_CATALOG_ENTRIES } from "./decision.simulation.catalog";
import type {
  ComplianceCatalogEntry,
  ComplianceCatalogManifest,
  ComplianceDomainKind,
  ComplianceValidation,
  ComplianceValidationManifest,
} from "./decision.compliance";
import { V74_DECISION_COMPLIANCE_VERSION } from "./decision.compliance";

const REQUIRED_DOMAINS: ComplianceDomainKind[] = [
  "policyMatch",
  "constraintMatch",
  "contextIntegrity",
  "evaluationIntegrity",
  "simulationIntegrity",
  "auditTrace",
  "versionConsistency",
  "rollbackReadiness",
];

export const COMPLIANCE_CATALOG_ENTRIES: ComplianceCatalogEntry[] = [
  {
    id: "DEC-CMP-001",
    domain: "policyMatch",
    purpose: "Verify decision policy catalog matches inventory policy refs",
    inputs: ["DEC-INP-003"],
    outputs: ["DEC-OUT-003"],
    criteria: ["policy-ref-aligned", "gate-documented"],
    evidence: "verify:v74-p2-decision-policy-catalog PASS",
    status: "passed",
    validation: "DEC-CML-001",
    upstreamRef: "DEC-PLC-001",
    required: true,
    description: "PolicyMatch — policy catalog alignment compliance",
  },
  {
    id: "DEC-CMP-002",
    domain: "constraintMatch",
    purpose: "Verify constraint catalog matches inventory constraint refs",
    inputs: ["DEC-INP-008"],
    outputs: ["DEC-OUT-008"],
    criteria: ["constraint-ref-aligned", "type-coverage-complete"],
    evidence: "verify:v74-p4-decision-constraint PASS",
    status: "passed",
    validation: "DEC-CML-002",
    upstreamRef: "DEC-CON-001",
    required: true,
    description: "ConstraintMatch — constraint catalog alignment compliance",
  },
  {
    id: "DEC-CMP-003",
    domain: "contextIntegrity",
    purpose: "Verify context domain catalog integrity across scopes",
    inputs: ["DEC-INP-001"],
    outputs: ["DEC-OUT-001"],
    criteria: ["domain-coverage-complete", "validation-linked"],
    evidence: "verify:v74-p3-decision-context PASS",
    status: "passed",
    validation: "DEC-CML-003",
    upstreamRef: "DEC-CTX-004",
    required: true,
    description: "ContextIntegrity — context catalog integrity compliance",
  },
  {
    id: "DEC-CMP-004",
    domain: "evaluationIntegrity",
    purpose: "Verify evaluation dimension catalog integrity",
    inputs: ["DEC-INP-007"],
    outputs: ["DEC-OUT-007"],
    criteria: ["dimension-coverage-complete", "threshold-documented"],
    evidence: "verify:v74-p5-decision-evaluation PASS",
    status: "passed",
    validation: "DEC-CML-004",
    upstreamRef: "DEC-EVAL-001",
    required: true,
    description: "EvaluationIntegrity — evaluation catalog integrity compliance",
  },
  {
    id: "DEC-CMP-005",
    domain: "simulationIntegrity",
    purpose: "Verify simulation type catalog integrity without execution",
    inputs: ["DEC-INP-006"],
    outputs: ["DEC-OUT-006"],
    criteria: ["simulation-type-complete", "assumptions-declared"],
    evidence: "verify:v74-p6-decision-simulation PASS",
    status: "passed",
    validation: "DEC-CML-005",
    upstreamRef: "DEC-SIM-001",
    required: true,
    description: "SimulationIntegrity — simulation catalog integrity compliance",
  },
  {
    id: "DEC-CMP-006",
    domain: "auditTrace",
    purpose: "Verify declarative audit trail evidence chain",
    inputs: ["DEC-INP-005"],
    outputs: ["DEC-OUT-005"],
    criteria: ["audit-evidence-present", "declarative-only"],
    evidence: "declarative:audit-trail-complete",
    status: "passed",
    validation: "DEC-CML-006",
    upstreamRef: "DEC-EVAL-008",
    required: true,
    description: "AuditTrace — declarative audit trail compliance",
  },
  {
    id: "DEC-CMP-007",
    domain: "versionConsistency",
    purpose: "Verify V74 phase version lock consistency",
    inputs: ["DEC-INP-002"],
    outputs: ["DEC-OUT-002"],
    criteria: ["version-lock-intact", "upstream-v73-aligned"],
    evidence: "v74-decision-inventory-1 chain verified",
    status: "passed",
    validation: "DEC-CML-007",
    upstreamRef: "DEC-SRC-001",
    required: true,
    description: "VersionConsistency — phase version lock compliance",
  },
  {
    id: "DEC-CMP-008",
    domain: "rollbackReadiness",
    purpose: "Verify rollback preview readiness without execution",
    inputs: ["DEC-INP-008"],
    outputs: ["DEC-OUT-008"],
    criteria: ["rollback-preview-declared", "v48-v73-frozen"],
    evidence: "DEC-SIM-008 rollbackPreview declared",
    status: "passed",
    validation: "DEC-CML-008",
    upstreamRef: "DEC-SIM-008",
    required: true,
    description: "RollbackReadiness — rollback preview compliance",
  },
];

export const COMPLIANCE_VALIDATION_CATALOG: ComplianceValidation[] = [
  {
    id: "DEC-CML-001",
    complianceRef: "DEC-CMP-001",
    validationKind: "policyMatch",
    passCondition: "policy-catalog-aligned",
    required: true,
    description: "PolicyMatch validation — catalog aligned",
  },
  {
    id: "DEC-CML-002",
    complianceRef: "DEC-CMP-002",
    validationKind: "constraintMatch",
    passCondition: "constraint-catalog-aligned",
    required: true,
    description: "ConstraintMatch validation — catalog aligned",
  },
  {
    id: "DEC-CML-003",
    complianceRef: "DEC-CMP-003",
    validationKind: "contextIntegrity",
    passCondition: "context-integrity-verified",
    required: true,
    description: "ContextIntegrity validation — integrity verified",
  },
  {
    id: "DEC-CML-004",
    complianceRef: "DEC-CMP-004",
    validationKind: "evaluationIntegrity",
    passCondition: "evaluation-integrity-verified",
    required: true,
    description: "EvaluationIntegrity validation — integrity verified",
  },
  {
    id: "DEC-CML-005",
    complianceRef: "DEC-CMP-005",
    validationKind: "simulationIntegrity",
    passCondition: "simulation-integrity-verified",
    required: true,
    description: "SimulationIntegrity validation — integrity verified",
  },
  {
    id: "DEC-CML-006",
    complianceRef: "DEC-CMP-006",
    validationKind: "auditTrace",
    passCondition: "audit-trace-documented",
    required: true,
    description: "AuditTrace validation — trace documented",
  },
  {
    id: "DEC-CML-007",
    complianceRef: "DEC-CMP-007",
    validationKind: "versionConsistency",
    passCondition: "version-lock-consistent",
    required: true,
    description: "VersionConsistency validation — lock consistent",
  },
  {
    id: "DEC-CML-008",
    complianceRef: "DEC-CMP-008",
    validationKind: "rollbackReadiness",
    passCondition: "rollback-preview-ready",
    required: true,
    description: "RollbackReadiness validation — preview ready",
  },
];

function upstreamRefExists(ref: string): boolean {
  const policyIds = new Set(POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const constraintIds = new Set(CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const contextIds = new Set(CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const evaluationIds = new Set(EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const simulationIds = new Set(SIMULATION_CATALOG_ENTRIES.map((s) => s.id));
  const sourceIds = new Set(["DEC-SRC-001", "DEC-SRC-002", "DEC-SRC-003", "DEC-SRC-004", "DEC-SRC-005", "DEC-SRC-006", "DEC-SRC-007", "DEC-SRC-008"]);

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
  return COMPLIANCE_CATALOG_ENTRIES.filter((i) => i.required).every(
    (i) => i.status === "passed" || i.status === "waived",
  );
}

export function isDecisionComplianceCatalogRefsAligned(): boolean {
  const inputIds = new Set(DECISION_INPUT_CATALOG.map((i) => i.id));
  const outputIds = new Set(DECISION_OUTPUT_CATALOG.map((o) => o.id));
  const validationIds = new Set(COMPLIANCE_VALIDATION_CATALOG.map((v) => v.id));
  const complianceIds = new Set(COMPLIANCE_CATALOG_ENTRIES.map((c) => c.id));
  const domains = new Set(COMPLIANCE_CATALOG_ENTRIES.map((c) => c.domain));

  const itemsAligned = COMPLIANCE_CATALOG_ENTRIES.every(
    (c) =>
      upstreamRefExists(c.upstreamRef) &&
      validationIds.has(c.validation) &&
      c.inputs.every((i) => inputIds.has(i)) &&
      c.outputs.every((o) => outputIds.has(o)) &&
      c.criteria.length >= 1 &&
      c.evidence.length > 0,
  );

  const validationsAligned = COMPLIANCE_VALIDATION_CATALOG.every((v) =>
    complianceIds.has(v.complianceRef),
  );

  const domainsComplete = REQUIRED_DOMAINS.every((d) => domains.has(d));

  return (
    itemsAligned &&
    validationsAligned &&
    domainsComplete &&
    COMPLIANCE_CATALOG_ENTRIES.length === 8 &&
    requiredItemsPassed()
  );
}

export function buildComplianceCatalogManifest(): ComplianceCatalogManifest {
  const items = COMPLIANCE_CATALOG_ENTRIES;
  const domains = new Set(items.map((c) => c.domain));
  const catalogComplete =
    items.length === 8 &&
    REQUIRED_DOMAINS.every((d) => domains.has(d)) &&
    requiredItemsPassed();

  return {
    version: V74_DECISION_COMPLIANCE_VERSION,
    entryCount: items.length,
    domainCount: domains.size,
    catalogComplete,
    items,
    summary: [
      `decision-compliance-catalog count=${items.length}`,
      `domains=${domains.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildComplianceValidationManifest(): ComplianceValidationManifest {
  const validations = COMPLIANCE_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V74_DECISION_COMPLIANCE_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `decision-compliance-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getComplianceCatalogEntryById(id: string): ComplianceCatalogEntry | undefined {
  return COMPLIANCE_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getComplianceCatalogEntriesByDomain(
  domain: ComplianceDomainKind,
): ComplianceCatalogEntry[] {
  return COMPLIANCE_CATALOG_ENTRIES.filter((c) => c.domain === domain);
}

export function getComplianceValidationByComplianceRef(
  complianceRef: string,
): ComplianceValidation | undefined {
  return COMPLIANCE_VALIDATION_CATALOG.find((v) => v.complianceRef === complianceRef);
}

export function computeDeclarativeCompliancePass(input: {
  status: ComplianceCatalogEntry["status"];
  required: boolean;
}): boolean {
  if (!input.required) return true;
  return input.status === "passed" || input.status === "waived";
}
