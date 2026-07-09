/**
 * V75 P7 — Agent compliance catalog (declarative)
 */
import { AGENT_CONSTRAINT_CATALOG_ENTRIES } from "./agent.constraint.catalog";
import { AGENT_CONTEXT_CATALOG_ENTRIES } from "./agent.context.catalog";
import { AGENT_EVALUATION_CATALOG_ENTRIES } from "./agent.evaluation.catalog";
import { AGENT_INPUT_CATALOG, AGENT_OUTPUT_CATALOG } from "./agent.inventory";
import { AGENT_POLICY_CATALOG_ENTRIES } from "./agent.policy.catalog";
import { AGENT_SIMULATION_CATALOG_ENTRIES } from "./agent.simulation.catalog";
import type {
  AgentComplianceCatalogEntry,
  AgentComplianceCatalogManifest,
  AgentComplianceDomainKind,
  AgentComplianceValidation,
  AgentComplianceValidationManifest,
} from "./agent.compliance";
import { V75_AGENT_COMPLIANCE_VERSION } from "./agent.compliance";

const REQUIRED_DOMAINS: AgentComplianceDomainKind[] = [
  "policyMatch",
  "constraintMatch",
  "contextIntegrity",
  "evaluationIntegrity",
  "simulationIntegrity",
  "auditTrace",
  "versionConsistency",
  "rollbackReadiness",
];

export const AGENT_COMPLIANCE_CATALOG_ENTRIES: AgentComplianceCatalogEntry[] = [
  {
    id: "AGT-CMP-001",
    domain: "policyMatch",
    purpose: "Verify agent policy catalog matches inventory policy refs",
    rule: "policy-ref-must-align-with-inventory",
    auditPoint: "verify:v75-p2-agent-policy-catalog",
    waiverCondition: "governance-approved-policy-exception",
    inputs: ["AGT-INP-003"],
    outputs: ["AGT-OUT-003"],
    criteria: ["policy-ref-aligned", "gate-documented"],
    evidence: "verify:v75-p2-agent-policy-catalog PASS",
    status: "passed",
    validation: "AGT-CML-001",
    upstreamRef: "AGT-PLC-001",
    required: true,
    description: "PolicyMatch — policy catalog alignment compliance",
  },
  {
    id: "AGT-CMP-002",
    domain: "constraintMatch",
    purpose: "Verify constraint catalog matches inventory constraint refs",
    rule: "constraint-ref-must-align-with-inventory",
    auditPoint: "verify:v75-p4-agent-constraint-catalog",
    waiverCondition: "temporary-constraint-exception-declared",
    inputs: ["AGT-INP-008"],
    outputs: ["AGT-OUT-008"],
    criteria: ["constraint-ref-aligned", "type-coverage-complete"],
    evidence: "verify:v75-p4-agent-constraint-catalog PASS",
    status: "passed",
    validation: "AGT-CML-002",
    upstreamRef: "AGT-CON-001",
    required: true,
    description: "ConstraintMatch — constraint catalog alignment compliance",
  },
  {
    id: "AGT-CMP-003",
    domain: "contextIntegrity",
    purpose: "Verify context domain catalog integrity across scopes",
    rule: "context-domain-coverage-must-be-complete",
    auditPoint: "verify:v75-p3-agent-context-catalog",
    waiverCondition: "scoped-context-waiver-documented",
    inputs: ["AGT-INP-001"],
    outputs: ["AGT-OUT-001"],
    criteria: ["domain-coverage-complete", "validation-linked"],
    evidence: "verify:v75-p3-agent-context-catalog PASS",
    status: "passed",
    validation: "AGT-CML-003",
    upstreamRef: "AGT-CTX-004",
    required: true,
    description: "ContextIntegrity — context catalog integrity compliance",
  },
  {
    id: "AGT-CMP-004",
    domain: "evaluationIntegrity",
    purpose: "Verify evaluation dimension catalog integrity",
    rule: "evaluation-dimension-threshold-must-be-declared",
    auditPoint: "verify:v75-p5-agent-evaluation-catalog",
    waiverCondition: "evaluation-waiver-with-audit-trail",
    inputs: ["AGT-INP-007"],
    outputs: ["AGT-OUT-007"],
    criteria: ["dimension-coverage-complete", "threshold-documented"],
    evidence: "verify:v75-p5-agent-evaluation-catalog PASS",
    status: "passed",
    validation: "AGT-CML-004",
    upstreamRef: "AGT-EVAL-001",
    required: true,
    description: "EvaluationIntegrity — evaluation catalog integrity compliance",
  },
  {
    id: "AGT-CMP-005",
    domain: "simulationIntegrity",
    purpose: "Verify simulation type catalog integrity without execution",
    rule: "simulation-assumptions-must-be-declared",
    auditPoint: "verify:v75-p6-agent-simulation-catalog",
    waiverCondition: "simulation-scope-reduction-approved",
    inputs: ["AGT-INP-006"],
    outputs: ["AGT-OUT-006"],
    criteria: ["simulation-type-complete", "assumptions-declared"],
    evidence: "verify:v75-p6-agent-simulation-catalog PASS",
    status: "passed",
    validation: "AGT-CML-005",
    upstreamRef: "AGT-SIM-001",
    required: true,
    description: "SimulationIntegrity — simulation catalog integrity compliance",
  },
  {
    id: "AGT-CMP-006",
    domain: "auditTrace",
    purpose: "Verify declarative audit trail evidence chain",
    rule: "audit-evidence-must-be-declarative-only",
    auditPoint: "declarative:audit-trail-complete",
    waiverCondition: "audit-deferral-with-expiry",
    inputs: ["AGT-INP-005"],
    outputs: ["AGT-OUT-005"],
    criteria: ["audit-evidence-present", "declarative-only"],
    evidence: "declarative:audit-trail-complete",
    status: "passed",
    validation: "AGT-CML-006",
    upstreamRef: "AGT-EVAL-008",
    required: true,
    description: "AuditTrace — declarative audit trail compliance",
  },
  {
    id: "AGT-CMP-007",
    domain: "versionConsistency",
    purpose: "Verify V75 phase version lock consistency",
    rule: "version-lock-must-match-upstream-v74",
    auditPoint: "v75-agent-inventory-1 chain verified",
    waiverCondition: "version-exception-not-permitted",
    inputs: ["AGT-INP-002"],
    outputs: ["AGT-OUT-002"],
    criteria: ["version-lock-intact", "upstream-v74-aligned"],
    evidence: "v75-agent-inventory-1 chain verified",
    status: "passed",
    validation: "AGT-CML-007",
    upstreamRef: "AGT-SRC-001",
    required: true,
    description: "VersionConsistency — phase version lock compliance",
  },
  {
    id: "AGT-CMP-008",
    domain: "rollbackReadiness",
    purpose: "Verify rollback preview readiness without execution",
    rule: "rollback-preview-must-be-declared",
    auditPoint: "AGT-SIM-008 rollbackPreview declared",
    waiverCondition: "rollback-waiver-governance-approved",
    inputs: ["AGT-INP-008"],
    outputs: ["AGT-OUT-008"],
    criteria: ["rollback-preview-declared", "v48-v74-frozen"],
    evidence: "AGT-SIM-008 rollbackPreview declared",
    status: "passed",
    validation: "AGT-CML-008",
    upstreamRef: "AGT-SIM-008",
    required: true,
    description: "RollbackReadiness — rollback preview compliance",
  },
];

export const AGENT_COMPLIANCE_VALIDATION_CATALOG: AgentComplianceValidation[] = [
  {
    id: "AGT-CML-001",
    complianceRef: "AGT-CMP-001",
    validationKind: "policyMatch",
    passCondition: "policy-catalog-aligned",
    required: true,
    description: "PolicyMatch validation — catalog aligned",
  },
  {
    id: "AGT-CML-002",
    complianceRef: "AGT-CMP-002",
    validationKind: "constraintMatch",
    passCondition: "constraint-catalog-aligned",
    required: true,
    description: "ConstraintMatch validation — catalog aligned",
  },
  {
    id: "AGT-CML-003",
    complianceRef: "AGT-CMP-003",
    validationKind: "contextIntegrity",
    passCondition: "context-integrity-verified",
    required: true,
    description: "ContextIntegrity validation — integrity verified",
  },
  {
    id: "AGT-CML-004",
    complianceRef: "AGT-CMP-004",
    validationKind: "evaluationIntegrity",
    passCondition: "evaluation-integrity-verified",
    required: true,
    description: "EvaluationIntegrity validation — integrity verified",
  },
  {
    id: "AGT-CML-005",
    complianceRef: "AGT-CMP-005",
    validationKind: "simulationIntegrity",
    passCondition: "simulation-integrity-verified",
    required: true,
    description: "SimulationIntegrity validation — integrity verified",
  },
  {
    id: "AGT-CML-006",
    complianceRef: "AGT-CMP-006",
    validationKind: "auditTrace",
    passCondition: "audit-trace-documented",
    required: true,
    description: "AuditTrace validation — trace documented",
  },
  {
    id: "AGT-CML-007",
    complianceRef: "AGT-CMP-007",
    validationKind: "versionConsistency",
    passCondition: "version-lock-consistent",
    required: true,
    description: "VersionConsistency validation — lock consistent",
  },
  {
    id: "AGT-CML-008",
    complianceRef: "AGT-CMP-008",
    validationKind: "rollbackReadiness",
    passCondition: "rollback-preview-ready",
    required: true,
    description: "RollbackReadiness validation — preview ready",
  },
];

function upstreamRefExists(ref: string): boolean {
  const policyIds = new Set(AGENT_POLICY_CATALOG_ENTRIES.map((p) => p.id));
  const constraintIds = new Set(AGENT_CONSTRAINT_CATALOG_ENTRIES.map((c) => c.id));
  const contextIds = new Set(AGENT_CONTEXT_CATALOG_ENTRIES.map((c) => c.id));
  const evaluationIds = new Set(AGENT_EVALUATION_CATALOG_ENTRIES.map((e) => e.id));
  const simulationIds = new Set(AGENT_SIMULATION_CATALOG_ENTRIES.map((s) => s.id));
  const sourceIds = new Set([
    "AGT-SRC-001",
    "AGT-SRC-002",
    "AGT-SRC-003",
    "AGT-SRC-004",
    "AGT-SRC-005",
    "AGT-SRC-006",
    "AGT-SRC-007",
    "AGT-SRC-008",
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
  return AGENT_COMPLIANCE_CATALOG_ENTRIES.filter((i) => i.required).every(
    (i) => i.status === "passed" || i.status === "waived",
  );
}

export function isAgentComplianceCatalogRefsAligned(): boolean {
  const inputIds = new Set(AGENT_INPUT_CATALOG.map((i) => i.id));
  const outputIds = new Set(AGENT_OUTPUT_CATALOG.map((o) => o.id));
  const validationIds = new Set(AGENT_COMPLIANCE_VALIDATION_CATALOG.map((v) => v.id));
  const complianceIds = new Set(AGENT_COMPLIANCE_CATALOG_ENTRIES.map((c) => c.id));
  const domains = new Set(AGENT_COMPLIANCE_CATALOG_ENTRIES.map((c) => c.domain));

  const itemsAligned = AGENT_COMPLIANCE_CATALOG_ENTRIES.every(
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

  const validationsAligned = AGENT_COMPLIANCE_VALIDATION_CATALOG.every((v) =>
    complianceIds.has(v.complianceRef),
  );

  const domainsComplete = REQUIRED_DOMAINS.every((d) => domains.has(d));

  return (
    itemsAligned &&
    validationsAligned &&
    domainsComplete &&
    AGENT_COMPLIANCE_CATALOG_ENTRIES.length === 8 &&
    requiredItemsPassed()
  );
}

export function buildAgentComplianceCatalogManifest(): AgentComplianceCatalogManifest {
  const items = AGENT_COMPLIANCE_CATALOG_ENTRIES;
  const domains = new Set(items.map((c) => c.domain));
  const catalogComplete =
    items.length === 8 &&
    REQUIRED_DOMAINS.every((d) => domains.has(d)) &&
    requiredItemsPassed();

  return {
    version: V75_AGENT_COMPLIANCE_VERSION,
    entryCount: items.length,
    domainCount: domains.size,
    catalogComplete,
    items,
    summary: [
      `agent-compliance-catalog count=${items.length}`,
      `domains=${domains.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAgentComplianceValidationManifest(): AgentComplianceValidationManifest {
  const validations = AGENT_COMPLIANCE_VALIDATION_CATALOG;
  const catalogComplete = validations.length >= 8;

  return {
    version: V75_AGENT_COMPLIANCE_VERSION,
    entryCount: validations.length,
    catalogComplete,
    validations,
    summary: [
      `agent-compliance-validations count=${validations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getAgentComplianceCatalogEntryById(
  id: string,
): AgentComplianceCatalogEntry | undefined {
  return AGENT_COMPLIANCE_CATALOG_ENTRIES.find((c) => c.id === id);
}

export function getAgentComplianceCatalogEntriesByDomain(
  domain: AgentComplianceDomainKind,
): AgentComplianceCatalogEntry[] {
  return AGENT_COMPLIANCE_CATALOG_ENTRIES.filter((c) => c.domain === domain);
}

export function getAgentComplianceValidationByComplianceRef(
  complianceRef: string,
): AgentComplianceValidation | undefined {
  return AGENT_COMPLIANCE_VALIDATION_CATALOG.find((v) => v.complianceRef === complianceRef);
}

export function computeAgentDeclarativeCompliancePass(input: {
  status: AgentComplianceCatalogEntry["status"];
  required: boolean;
}): boolean {
  if (!input.required) return true;
  return input.status === "passed" || input.status === "waived";
}
