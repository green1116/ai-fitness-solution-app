/**
 * V71 P5 — Workflow governance rules (declarative)
 */
import { ORCHESTRATION_CATALOG } from "./orchestration.catalog";
import { WORKFLOW_VERSION_PAIR_CATALOG } from "./compatibility.matrix";
import type {
  AuditTrail,
  AuditTrailManifest,
  Escalation,
  EscalationManifest,
  FreezeGate,
  FreezeGateManifest,
  GovernanceException,
  GovernanceExceptionManifest,
  GovernanceRule,
  GovernanceRuleManifest,
  Review,
  ReviewManifest,
  Signoff,
  SignoffManifest,
} from "./workflow.governance";
import { V71_WORKFLOW_GOVERNANCE_VERSION } from "./workflow.governance";

export const GOVERNANCE_RULE_CATALOG: GovernanceRule[] = [
  {
    id: "ORC-GOV-001",
    scope: "global",
    scopeRef: "*",
    approval: "approved",
    review: "ORC-GOV-REV-001",
    exception: "ORC-GOV-EXC-001",
    escalation: "ORC-GOV-ESC-001",
    auditTrail: "ORC-GOV-AUD-001",
    freezeGate: "ORC-GOV-FRZ-001",
    signoff: "ORC-GOV-SIG-001",
    riskLevel: "medium",
    compatibilityCheck: "ORC-WPX-001",
    required: true,
    description: "Global orchestration catalog governance rule",
  },
  {
    id: "ORC-GOV-002",
    scope: "orchestration",
    scopeRef: "ORC-001",
    approval: "approved",
    review: "ORC-GOV-REV-002",
    exception: "ORC-GOV-EXC-002",
    escalation: "ORC-GOV-ESC-002",
    auditTrail: "ORC-GOV-AUD-002",
    freezeGate: "ORC-GOV-FRZ-002",
    signoff: "ORC-GOV-SIG-002",
    riskLevel: "high",
    compatibilityCheck: "ORC-WPX-001",
    required: true,
    description: "Delivery lifecycle orchestration governance rule",
  },
  {
    id: "ORC-GOV-003",
    scope: "workflow",
    scopeRef: "ORC-002",
    approval: "required",
    review: "ORC-GOV-REV-003",
    exception: "ORC-GOV-EXC-003",
    escalation: "ORC-GOV-ESC-003",
    auditTrail: "ORC-GOV-AUD-003",
    freezeGate: "ORC-GOV-FRZ-003",
    signoff: "ORC-GOV-SIG-003",
    riskLevel: "high",
    compatibilityCheck: "ORC-WPX-002",
    required: true,
    description: "Dependency resolution workflow governance rule",
  },
  {
    id: "ORC-GOV-004",
    scope: "workflow",
    scopeRef: "ORC-003",
    approval: "required",
    review: "ORC-GOV-REV-004",
    exception: "ORC-GOV-EXC-004",
    escalation: "ORC-GOV-ESC-004",
    auditTrail: "ORC-GOV-AUD-004",
    freezeGate: "ORC-GOV-FRZ-004",
    signoff: "ORC-GOV-SIG-004",
    riskLevel: "medium",
    compatibilityCheck: "ORC-WPX-003",
    required: true,
    description: "Policy gate workflow governance rule",
  },
  {
    id: "ORC-GOV-005",
    scope: "action",
    scopeRef: "compatibility-scan",
    approval: "approved",
    review: "ORC-GOV-REV-005",
    exception: "ORC-GOV-EXC-005",
    escalation: "ORC-GOV-ESC-005",
    auditTrail: "ORC-GOV-AUD-005",
    freezeGate: "ORC-GOV-FRZ-005",
    signoff: "ORC-GOV-SIG-005",
    riskLevel: "medium",
    compatibilityCheck: "ORC-WPX-005",
    required: true,
    description: "Compatibility scan action governance rule",
  },
  {
    id: "ORC-GOV-006",
    scope: "workflow",
    scopeRef: "ORC-006",
    approval: "required",
    review: "ORC-GOV-REV-006",
    exception: "ORC-GOV-EXC-006",
    escalation: "ORC-GOV-ESC-006",
    auditTrail: "ORC-GOV-AUD-006",
    freezeGate: "ORC-GOV-FRZ-006",
    signoff: "ORC-GOV-SIG-006",
    riskLevel: "critical",
    compatibilityCheck: "ORC-WPX-007",
    required: true,
    description: "Lifecycle transition workflow governance rule",
  },
  {
    id: "ORC-GOV-007",
    scope: "action",
    scopeRef: "compliance-audit",
    approval: "required",
    review: "ORC-GOV-REV-007",
    exception: "ORC-GOV-EXC-007",
    escalation: "ORC-GOV-ESC-007",
    auditTrail: "ORC-GOV-AUD-007",
    freezeGate: "ORC-GOV-FRZ-007",
    signoff: "ORC-GOV-SIG-007",
    riskLevel: "high",
    compatibilityCheck: "ORC-WPX-008",
    required: true,
    description: "Compliance audit action governance rule",
  },
  {
    id: "ORC-GOV-008",
    scope: "orchestration",
    scopeRef: "ORC-008",
    approval: "waived",
    review: "ORC-GOV-REV-008",
    exception: "ORC-GOV-EXC-008",
    escalation: "ORC-GOV-ESC-008",
    auditTrail: "ORC-GOV-AUD-008",
    freezeGate: "ORC-GOV-FRZ-008",
    signoff: "ORC-GOV-SIG-008",
    riskLevel: "low",
    compatibilityCheck: "ORC-WPX-004",
    required: true,
    description: "Sign-off freeze orchestration governance rule",
  },
];

export const REVIEW_CATALOG: Review[] = [
  {
    id: "ORC-GOV-REV-001",
    governanceRuleRef: "ORC-GOV-001",
    reviewKind: "catalog",
    passCondition: "orchestration catalog complete",
    required: true,
    description: "Global catalog review",
  },
  {
    id: "ORC-GOV-REV-002",
    governanceRuleRef: "ORC-GOV-002",
    reviewKind: "freeze",
    passCondition: "v70-delivery-freeze-1 intact",
    required: true,
    description: "Delivery freeze baseline review",
  },
  {
    id: "ORC-GOV-REV-003",
    governanceRuleRef: "ORC-GOV-003",
    reviewKind: "graph",
    passCondition: "workflow dependency acyclic",
    required: true,
    description: "Dependency graph review",
  },
  {
    id: "ORC-GOV-REV-004",
    governanceRuleRef: "ORC-GOV-004",
    reviewKind: "policy",
    passCondition: "workflow policy ready",
    required: true,
    description: "Policy gate review",
  },
  {
    id: "ORC-GOV-REV-005",
    governanceRuleRef: "ORC-GOV-005",
    reviewKind: "matrix",
    passCondition: "compatibility matrix complete",
    required: true,
    description: "Compatibility matrix review",
  },
  {
    id: "ORC-GOV-REV-006",
    governanceRuleRef: "ORC-GOV-006",
    reviewKind: "lifecycle",
    passCondition: "lifecycle state valid",
    required: true,
    description: "Lifecycle transition review",
  },
  {
    id: "ORC-GOV-REV-007",
    governanceRuleRef: "ORC-GOV-007",
    reviewKind: "compliance",
    passCondition: "compliance audit pass",
    required: true,
    description: "Compliance audit review",
  },
  {
    id: "ORC-GOV-REV-008",
    governanceRuleRef: "ORC-GOV-008",
    reviewKind: "signoff",
    passCondition: "all upstream governance ready",
    required: true,
    description: "Sign-off freeze review",
  },
];

export const GOVERNANCE_EXCEPTION_CATALOG: GovernanceException[] = [
  {
    id: "ORC-GOV-EXC-001",
    governanceRuleRef: "ORC-GOV-001",
    exceptionKind: "catalog-waiver",
    status: "rejected",
    required: true,
    description: "Catalog incomplete waiver rejected",
  },
  {
    id: "ORC-GOV-EXC-002",
    governanceRuleRef: "ORC-GOV-002",
    exceptionKind: "freeze-bypass",
    status: "rejected",
    required: true,
    description: "Delivery freeze bypass rejected",
  },
  {
    id: "ORC-GOV-EXC-003",
    governanceRuleRef: "ORC-GOV-003",
    exceptionKind: "dependency-skip",
    status: "pending",
    required: true,
    description: "Dependency resolution skip pending",
  },
  {
    id: "ORC-GOV-EXC-004",
    governanceRuleRef: "ORC-GOV-004",
    exceptionKind: "policy-waiver",
    status: "rejected",
    required: true,
    description: "Policy gate waiver rejected",
  },
  {
    id: "ORC-GOV-EXC-005",
    governanceRuleRef: "ORC-GOV-005",
    exceptionKind: "scan-defer",
    status: "approved",
    required: true,
    description: "Compatibility scan defer template (none active)",
  },
  {
    id: "ORC-GOV-EXC-006",
    governanceRuleRef: "ORC-GOV-006",
    exceptionKind: "lifecycle-skip",
    status: "rejected",
    required: true,
    description: "Lifecycle transition skip rejected",
  },
  {
    id: "ORC-GOV-EXC-007",
    governanceRuleRef: "ORC-GOV-007",
    exceptionKind: "audit-waiver",
    status: "pending",
    required: true,
    description: "Compliance audit waiver pending",
  },
  {
    id: "ORC-GOV-EXC-008",
    governanceRuleRef: "ORC-GOV-008",
    exceptionKind: "signoff-skip",
    status: "rejected",
    required: true,
    description: "Sign-off skip rejected",
  },
];

export const ESCALATION_CATALOG: Escalation[] = [
  {
    id: "ORC-GOV-ESC-001",
    governanceRuleRef: "ORC-GOV-001",
    escalationLevel: "L1",
    triggerCondition: "catalog incomplete",
    required: true,
    description: "Catalog failure L1 escalation",
  },
  {
    id: "ORC-GOV-ESC-002",
    governanceRuleRef: "ORC-GOV-002",
    escalationLevel: "L2",
    triggerCondition: "freeze breach detected",
    required: true,
    description: "Freeze breach L2 escalation",
  },
  {
    id: "ORC-GOV-ESC-003",
    governanceRuleRef: "ORC-GOV-003",
    escalationLevel: "L2",
    triggerCondition: "cyclic dependency detected",
    required: true,
    description: "Dependency cycle L2 escalation",
  },
  {
    id: "ORC-GOV-ESC-004",
    governanceRuleRef: "ORC-GOV-004",
    escalationLevel: "L1",
    triggerCondition: "policy gate failure",
    required: true,
    description: "Policy gate L1 escalation",
  },
  {
    id: "ORC-GOV-ESC-005",
    governanceRuleRef: "ORC-GOV-005",
    escalationLevel: "L1",
    triggerCondition: "compatibility mismatch",
    required: true,
    description: "Compatibility mismatch L1 escalation",
  },
  {
    id: "ORC-GOV-ESC-006",
    governanceRuleRef: "ORC-GOV-006",
    escalationLevel: "L3",
    triggerCondition: "lifecycle transition failure",
    required: true,
    description: "Lifecycle failure L3 escalation",
  },
  {
    id: "ORC-GOV-ESC-007",
    governanceRuleRef: "ORC-GOV-007",
    escalationLevel: "L2",
    triggerCondition: "compliance audit failure",
    required: true,
    description: "Compliance failure L2 escalation",
  },
  {
    id: "ORC-GOV-ESC-008",
    governanceRuleRef: "ORC-GOV-008",
    escalationLevel: "L1",
    triggerCondition: "signoff blocked",
    required: true,
    description: "Sign-off blocked L1 escalation",
  },
];

export const GOVERNANCE_AUDIT_TRAIL_CATALOG: AuditTrail[] = [
  {
    id: "ORC-GOV-AUD-001",
    governanceRuleRef: "ORC-GOV-001",
    event: "workflow.governance.catalog",
    retention: "365d",
    required: true,
    description: "Global catalog governance audit trail",
  },
  {
    id: "ORC-GOV-AUD-002",
    governanceRuleRef: "ORC-GOV-002",
    event: "workflow.governance.freeze",
    retention: "365d",
    required: true,
    description: "Delivery freeze governance audit trail",
  },
  {
    id: "ORC-GOV-AUD-003",
    governanceRuleRef: "ORC-GOV-003",
    event: "workflow.governance.dependency",
    retention: "180d",
    required: true,
    description: "Dependency governance audit trail",
  },
  {
    id: "ORC-GOV-AUD-004",
    governanceRuleRef: "ORC-GOV-004",
    event: "workflow.governance.policy",
    retention: "180d",
    required: true,
    description: "Policy gate governance audit trail",
  },
  {
    id: "ORC-GOV-AUD-005",
    governanceRuleRef: "ORC-GOV-005",
    event: "workflow.governance.compatibility",
    retention: "180d",
    required: true,
    description: "Compatibility governance audit trail",
  },
  {
    id: "ORC-GOV-AUD-006",
    governanceRuleRef: "ORC-GOV-006",
    event: "workflow.governance.lifecycle",
    retention: "730d",
    required: true,
    description: "Lifecycle governance audit trail",
  },
  {
    id: "ORC-GOV-AUD-007",
    governanceRuleRef: "ORC-GOV-007",
    event: "workflow.governance.compliance",
    retention: "365d",
    required: true,
    description: "Compliance governance audit trail",
  },
  {
    id: "ORC-GOV-AUD-008",
    governanceRuleRef: "ORC-GOV-008",
    event: "workflow.governance.signoff",
    retention: "365d",
    required: true,
    description: "Sign-off governance audit trail",
  },
];

export const FREEZE_GATE_CATALOG: FreezeGate[] = [
  {
    id: "ORC-GOV-FRZ-001",
    governanceRuleRef: "ORC-GOV-001",
    freezeVersion: "v71-orchestration-catalog-freeze-1",
    gateCondition: "catalogReady === true",
    required: true,
    description: "Orchestration catalog freeze gate",
  },
  {
    id: "ORC-GOV-FRZ-002",
    governanceRuleRef: "ORC-GOV-002",
    freezeVersion: "v70-delivery-freeze-1",
    gateCondition: "upstream delivery frozen",
    required: true,
    description: "V70 delivery baseline freeze gate",
  },
  {
    id: "ORC-GOV-FRZ-003",
    governanceRuleRef: "ORC-GOV-003",
    freezeVersion: "v71-workflow-dependency-freeze-1",
    gateCondition: "dependencyReady === true",
    required: true,
    description: "Workflow dependency freeze gate",
  },
  {
    id: "ORC-GOV-FRZ-004",
    governanceRuleRef: "ORC-GOV-004",
    freezeVersion: "v71-workflow-policy-freeze-1",
    gateCondition: "policyReady === true",
    required: true,
    description: "Workflow policy freeze gate",
  },
  {
    id: "ORC-GOV-FRZ-005",
    governanceRuleRef: "ORC-GOV-005",
    freezeVersion: "v71-workflow-compatibility-freeze-1",
    gateCondition: "compatibilityReady === true",
    required: true,
    description: "Workflow compatibility freeze gate",
  },
  {
    id: "ORC-GOV-FRZ-006",
    governanceRuleRef: "ORC-GOV-006",
    freezeVersion: "v71-workflow-governance-freeze-1",
    gateCondition: "lifecycle state valid",
    required: true,
    description: "Lifecycle transition freeze gate",
  },
  {
    id: "ORC-GOV-FRZ-007",
    governanceRuleRef: "ORC-GOV-007",
    freezeVersion: "v71-workflow-compatibility-freeze-1",
    gateCondition: "compliance audit pass",
    required: true,
    description: "Compliance audit freeze gate",
  },
  {
    id: "ORC-GOV-FRZ-008",
    governanceRuleRef: "ORC-GOV-008",
    freezeVersion: "v71-workflow-governance-freeze-1",
    gateCondition: "all upstream gates pass",
    required: true,
    description: "Sign-off freeze gate",
  },
];

export const SIGNOFF_CATALOG: Signoff[] = [
  {
    id: "ORC-GOV-SIG-001",
    governanceRuleRef: "ORC-GOV-001",
    signoffKind: "catalog",
    passCondition: "readinessScore === 100",
    required: true,
    description: "Catalog governance signoff",
  },
  {
    id: "ORC-GOV-SIG-002",
    governanceRuleRef: "ORC-GOV-002",
    signoffKind: "freeze",
    passCondition: "delivery baseline signed off",
    required: true,
    description: "Delivery freeze signoff",
  },
  {
    id: "ORC-GOV-SIG-003",
    governanceRuleRef: "ORC-GOV-003",
    signoffKind: "dependency",
    passCondition: "dependencyReady === true",
    required: true,
    description: "Dependency governance signoff",
  },
  {
    id: "ORC-GOV-SIG-004",
    governanceRuleRef: "ORC-GOV-004",
    signoffKind: "policy",
    passCondition: "policyReady === true",
    required: true,
    description: "Policy governance signoff",
  },
  {
    id: "ORC-GOV-SIG-005",
    governanceRuleRef: "ORC-GOV-005",
    signoffKind: "compatibility",
    passCondition: "compatibilityReady === true",
    required: true,
    description: "Compatibility governance signoff",
  },
  {
    id: "ORC-GOV-SIG-006",
    governanceRuleRef: "ORC-GOV-006",
    signoffKind: "lifecycle",
    passCondition: "lifecycle transition approved",
    required: true,
    description: "Lifecycle governance signoff",
  },
  {
    id: "ORC-GOV-SIG-007",
    governanceRuleRef: "ORC-GOV-007",
    signoffKind: "compliance",
    passCondition: "compliance audit signed off",
    required: true,
    description: "Compliance governance signoff",
  },
  {
    id: "ORC-GOV-SIG-008",
    governanceRuleRef: "ORC-GOV-008",
    signoffKind: "final",
    passCondition: "governanceReady === true",
    required: true,
    description: "Final workflow governance signoff",
  },
];

export function isWorkflowGovernanceRefsAligned(): boolean {
  const orchestrationIds = new Set(ORCHESTRATION_CATALOG.map((o) => o.id));
  const pairIds = new Set(WORKFLOW_VERSION_PAIR_CATALOG.map((p) => p.id));
  const ruleIds = new Set(GOVERNANCE_RULE_CATALOG.map((r) => r.id));
  const reviewIds = new Set(REVIEW_CATALOG.map((r) => r.id));
  const exceptionIds = new Set(GOVERNANCE_EXCEPTION_CATALOG.map((e) => e.id));
  const escalationIds = new Set(ESCALATION_CATALOG.map((e) => e.id));
  const auditIds = new Set(GOVERNANCE_AUDIT_TRAIL_CATALOG.map((a) => a.id));
  const freezeIds = new Set(FREEZE_GATE_CATALOG.map((f) => f.id));
  const signoffIds = new Set(SIGNOFF_CATALOG.map((s) => s.id));

  const rulesAligned = GOVERNANCE_RULE_CATALOG.every((rule) => {
    if (rule.scope === "orchestration" || rule.scope === "workflow") {
      return orchestrationIds.has(rule.scopeRef);
    }
    return true;
  });

  const compatibilityAligned = GOVERNANCE_RULE_CATALOG.every((rule) =>
    pairIds.has(rule.compatibilityCheck),
  );

  const ruleRefsComplete = GOVERNANCE_RULE_CATALOG.every(
    (rule) =>
      reviewIds.has(rule.review) &&
      exceptionIds.has(rule.exception) &&
      escalationIds.has(rule.escalation) &&
      auditIds.has(rule.auditTrail) &&
      freezeIds.has(rule.freezeGate) &&
      signoffIds.has(rule.signoff),
  );

  const childRefsAligned =
    REVIEW_CATALOG.every((r) => ruleIds.has(r.governanceRuleRef)) &&
    GOVERNANCE_EXCEPTION_CATALOG.every((e) => ruleIds.has(e.governanceRuleRef)) &&
    ESCALATION_CATALOG.every((e) => ruleIds.has(e.governanceRuleRef)) &&
    GOVERNANCE_AUDIT_TRAIL_CATALOG.every((a) => ruleIds.has(a.governanceRuleRef)) &&
    FREEZE_GATE_CATALOG.every((f) => ruleIds.has(f.governanceRuleRef)) &&
    SIGNOFF_CATALOG.every((s) => ruleIds.has(s.governanceRuleRef));

  const coverageComplete = GOVERNANCE_RULE_CATALOG.every((rule) =>
    REVIEW_CATALOG.some((r) => r.governanceRuleRef === rule.id),
  );

  return (
    rulesAligned &&
    compatibilityAligned &&
    ruleRefsComplete &&
    childRefsAligned &&
    coverageComplete
  );
}

export function buildGovernanceRuleManifest(): GovernanceRuleManifest {
  const rules = GOVERNANCE_RULE_CATALOG;
  const scopes = new Set(rules.map((r) => r.scope));
  const riskLevels = new Set(rules.map((r) => r.riskLevel));
  const catalogComplete = rules.length >= 6 && scopes.size >= 3 && riskLevels.size >= 3;

  return {
    version: V71_WORKFLOW_GOVERNANCE_VERSION,
    ruleCount: rules.length,
    scopeCount: scopes.size,
    riskLevelCount: riskLevels.size,
    catalogComplete,
    rules,
    summary: [
      `governance-rules count=${rules.length}`,
      `scopes=${scopes.size}`,
      `riskLevels=${riskLevels.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildReviewManifest(): ReviewManifest {
  const reviews = REVIEW_CATALOG;
  const catalogComplete = reviews.length >= 6;

  return {
    version: V71_WORKFLOW_GOVERNANCE_VERSION,
    entryCount: reviews.length,
    catalogComplete,
    reviews,
    summary: [`reviews count=${reviews.length}`, `complete=${catalogComplete}`].join(" "),
  };
}

export function buildGovernanceExceptionManifest(): GovernanceExceptionManifest {
  const exceptions = GOVERNANCE_EXCEPTION_CATALOG;
  const statuses = new Set(exceptions.map((e) => e.status));
  const catalogComplete = exceptions.length >= 6 && statuses.size >= 3;

  return {
    version: V71_WORKFLOW_GOVERNANCE_VERSION,
    entryCount: exceptions.length,
    statusCount: statuses.size,
    catalogComplete,
    exceptions,
    summary: [
      `governance-exceptions count=${exceptions.length}`,
      `statuses=${statuses.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildEscalationManifest(): EscalationManifest {
  const escalations = ESCALATION_CATALOG;
  const catalogComplete = escalations.length >= 6;

  return {
    version: V71_WORKFLOW_GOVERNANCE_VERSION,
    entryCount: escalations.length,
    catalogComplete,
    escalations,
    summary: [
      `escalations count=${escalations.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildGovernanceAuditTrailManifest(): AuditTrailManifest {
  const trails = GOVERNANCE_AUDIT_TRAIL_CATALOG;
  const catalogComplete = trails.length >= 6;

  return {
    version: V71_WORKFLOW_GOVERNANCE_VERSION,
    entryCount: trails.length,
    catalogComplete,
    trails,
    summary: [
      `governance-audit-trails count=${trails.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildFreezeGateManifest(): FreezeGateManifest {
  const gates = FREEZE_GATE_CATALOG;
  const catalogComplete = gates.length >= 6;

  return {
    version: V71_WORKFLOW_GOVERNANCE_VERSION,
    entryCount: gates.length,
    catalogComplete,
    gates,
    summary: [`freeze-gates count=${gates.length}`, `complete=${catalogComplete}`].join(" "),
  };
}

export function buildSignoffManifest(): SignoffManifest {
  const signoffs = SIGNOFF_CATALOG;
  const catalogComplete = signoffs.length >= 6;

  return {
    version: V71_WORKFLOW_GOVERNANCE_VERSION,
    entryCount: signoffs.length,
    catalogComplete,
    signoffs,
    summary: [`signoffs count=${signoffs.length}`, `complete=${catalogComplete}`].join(" "),
  };
}

export function getGovernanceRuleById(id: string): GovernanceRule | undefined {
  return GOVERNANCE_RULE_CATALOG.find((r) => r.id === id);
}

export function getGovernanceRulesByScope(
  scope: GovernanceRule["scope"],
): GovernanceRule[] {
  return GOVERNANCE_RULE_CATALOG.filter((r) => r.scope === scope);
}

export function getGovernanceRulesByRiskLevel(
  riskLevel: GovernanceRule["riskLevel"],
): GovernanceRule[] {
  return GOVERNANCE_RULE_CATALOG.filter((r) => r.riskLevel === riskLevel);
}

export function getReviewByRuleRef(governanceRuleRef: string): Review | undefined {
  return REVIEW_CATALOG.find((r) => r.governanceRuleRef === governanceRuleRef);
}

export function getExceptionByRuleRef(
  governanceRuleRef: string,
): GovernanceException | undefined {
  return GOVERNANCE_EXCEPTION_CATALOG.find((e) => e.governanceRuleRef === governanceRuleRef);
}

export function getEscalationByRuleRef(governanceRuleRef: string): Escalation | undefined {
  return ESCALATION_CATALOG.find((e) => e.governanceRuleRef === governanceRuleRef);
}

export function getAuditTrailByRuleRef(governanceRuleRef: string): AuditTrail | undefined {
  return GOVERNANCE_AUDIT_TRAIL_CATALOG.find((a) => a.governanceRuleRef === governanceRuleRef);
}

export function getFreezeGateByRuleRef(governanceRuleRef: string): FreezeGate | undefined {
  return FREEZE_GATE_CATALOG.find((f) => f.governanceRuleRef === governanceRuleRef);
}

export function getSignoffByRuleRef(governanceRuleRef: string): Signoff | undefined {
  return SIGNOFF_CATALOG.find((s) => s.governanceRuleRef === governanceRuleRef);
}

export function computeDeclarativeGovernanceRiskBlock(input: {
  riskLevel: GovernanceRule["riskLevel"];
  approval: GovernanceRule["approval"];
}): boolean {
  return (
    (input.riskLevel === "critical" || input.riskLevel === "high") &&
    input.approval === "required"
  );
}
