/**
 * V72 P5 — Intelligence governance rules (declarative)
 */
import { INTELLIGENCE_VERSION_PAIR_CATALOG } from "./compatibility.matrix";
import { INTELLIGENCE_CATALOG } from "./intelligence.catalog";
import type {
  AuditTrail,
  AuditTrailManifest,
  Escalation,
  EscalationManifest,
  Exception,
  ExceptionManifest,
  FreezeGate,
  FreezeGateManifest,
  GovernanceRule,
  GovernanceRuleManifest,
  Review,
  ReviewManifest,
  Signoff,
  SignoffManifest,
} from "./intelligence.governance";
import { V72_INTELLIGENCE_GOVERNANCE_VERSION } from "./intelligence.governance";

export const GOVERNANCE_RULE_CATALOG: GovernanceRule[] = [
  {
    id: "INT-GOV-001",
    scope: "global",
    scopeRef: "*",
    approval: "approved",
    review: "INT-GOV-REV-001",
    exception: "INT-GOV-EXC-001",
    escalation: "INT-GOV-ESC-001",
    auditTrail: "INT-GOV-AUD-001",
    freezeGate: "INT-GOV-FRZ-001",
    signoff: "INT-GOV-SIG-001",
    riskLevel: "medium",
    compatibilityCheck: "INT-VPX-001",
    required: true,
    description: "Global intelligence catalog governance rule",
  },
  {
    id: "INT-GOV-002",
    scope: "insight",
    scopeRef: "INT-001",
    approval: "approved",
    review: "INT-GOV-REV-002",
    exception: "INT-GOV-EXC-002",
    escalation: "INT-GOV-ESC-002",
    auditTrail: "INT-GOV-AUD-002",
    freezeGate: "INT-GOV-FRZ-002",
    signoff: "INT-GOV-SIG-002",
    riskLevel: "high",
    compatibilityCheck: "INT-VPX-001",
    required: true,
    description: "Orchestration baseline insight governance rule",
  },
  {
    id: "INT-GOV-003",
    scope: "signal",
    scopeRef: "INT-002",
    approval: "required",
    review: "INT-GOV-REV-003",
    exception: "INT-GOV-EXC-003",
    escalation: "INT-GOV-ESC-003",
    auditTrail: "INT-GOV-AUD-003",
    freezeGate: "INT-GOV-FRZ-003",
    signoff: "INT-GOV-SIG-003",
    riskLevel: "high",
    compatibilityCheck: "INT-VPX-002",
    required: true,
    description: "Dependency acyclic signal governance rule",
  },
  {
    id: "INT-GOV-004",
    scope: "insight",
    scopeRef: "INT-003",
    approval: "required",
    review: "INT-GOV-REV-004",
    exception: "INT-GOV-EXC-004",
    escalation: "INT-GOV-ESC-004",
    auditTrail: "INT-GOV-AUD-004",
    freezeGate: "INT-GOV-FRZ-004",
    signoff: "INT-GOV-SIG-004",
    riskLevel: "medium",
    compatibilityCheck: "INT-VPX-003",
    required: true,
    description: "Policy gate insight governance rule",
  },
  {
    id: "INT-GOV-005",
    scope: "metric",
    scopeRef: "matrixComplete",
    approval: "approved",
    review: "INT-GOV-REV-005",
    exception: "INT-GOV-EXC-005",
    escalation: "INT-GOV-ESC-005",
    auditTrail: "INT-GOV-AUD-005",
    freezeGate: "INT-GOV-FRZ-005",
    signoff: "INT-GOV-SIG-005",
    riskLevel: "medium",
    compatibilityCheck: "INT-VPX-005",
    required: true,
    description: "Compatibility matrix metric governance rule",
  },
  {
    id: "INT-GOV-006",
    scope: "signal",
    scopeRef: "INT-005",
    approval: "required",
    review: "INT-GOV-REV-006",
    exception: "INT-GOV-EXC-006",
    escalation: "INT-GOV-ESC-006",
    auditTrail: "INT-GOV-AUD-006",
    freezeGate: "INT-GOV-FRZ-006",
    signoff: "INT-GOV-SIG-006",
    riskLevel: "critical",
    compatibilityCheck: "INT-VPX-007",
    required: true,
    description: "Governance risk escalation signal governance rule",
  },
  {
    id: "INT-GOV-007",
    scope: "metric",
    scopeRef: "compliance-audit",
    approval: "required",
    review: "INT-GOV-REV-007",
    exception: "INT-GOV-EXC-007",
    escalation: "INT-GOV-ESC-007",
    auditTrail: "INT-GOV-AUD-007",
    freezeGate: "INT-GOV-FRZ-007",
    signoff: "INT-GOV-SIG-007",
    riskLevel: "high",
    compatibilityCheck: "INT-VPX-008",
    required: true,
    description: "Compliance audit metric governance rule",
  },
  {
    id: "INT-GOV-008",
    scope: "insight",
    scopeRef: "INT-008",
    approval: "waived",
    review: "INT-GOV-REV-008",
    exception: "INT-GOV-EXC-008",
    escalation: "INT-GOV-ESC-008",
    auditTrail: "INT-GOV-AUD-008",
    freezeGate: "INT-GOV-FRZ-008",
    signoff: "INT-GOV-SIG-008",
    riskLevel: "low",
    compatibilityCheck: "INT-VPX-004",
    required: true,
    description: "Sign-off freeze insight governance rule",
  },
];

export const REVIEW_CATALOG: Review[] = [
  {
    id: "INT-GOV-REV-001",
    governanceRuleRef: "INT-GOV-001",
    reviewKind: "catalog",
    passCondition: "intelligence catalog complete",
    required: true,
    description: "Global catalog review",
  },
  {
    id: "INT-GOV-REV-002",
    governanceRuleRef: "INT-GOV-002",
    reviewKind: "freeze",
    passCondition: "v71-workflow-freeze-1 intact",
    required: true,
    description: "Workflow freeze baseline review",
  },
  {
    id: "INT-GOV-REV-003",
    governanceRuleRef: "INT-GOV-003",
    reviewKind: "graph",
    passCondition: "signal dependency acyclic",
    required: true,
    description: "Dependency graph review",
  },
  {
    id: "INT-GOV-REV-004",
    governanceRuleRef: "INT-GOV-004",
    reviewKind: "policy",
    passCondition: "intelligence policy ready",
    required: true,
    description: "Policy gate review",
  },
  {
    id: "INT-GOV-REV-005",
    governanceRuleRef: "INT-GOV-005",
    reviewKind: "matrix",
    passCondition: "compatibility matrix complete",
    required: true,
    description: "Compatibility matrix review",
  },
  {
    id: "INT-GOV-REV-006",
    governanceRuleRef: "INT-GOV-006",
    reviewKind: "lifecycle",
    passCondition: "lifecycle state valid",
    required: true,
    description: "Lifecycle transition review",
  },
  {
    id: "INT-GOV-REV-007",
    governanceRuleRef: "INT-GOV-007",
    reviewKind: "compliance",
    passCondition: "compliance audit pass",
    required: true,
    description: "Compliance audit review",
  },
  {
    id: "INT-GOV-REV-008",
    governanceRuleRef: "INT-GOV-008",
    reviewKind: "signoff",
    passCondition: "all upstream governance ready",
    required: true,
    description: "Sign-off freeze review",
  },
];

export const GOVERNANCE_EXCEPTION_CATALOG: Exception[] = [
  {
    id: "INT-GOV-EXC-001",
    governanceRuleRef: "INT-GOV-001",
    exceptionKind: "catalog-waiver",
    status: "rejected",
    required: true,
    description: "Catalog incomplete waiver rejected",
  },
  {
    id: "INT-GOV-EXC-002",
    governanceRuleRef: "INT-GOV-002",
    exceptionKind: "freeze-bypass",
    status: "rejected",
    required: true,
    description: "Workflow freeze bypass rejected",
  },
  {
    id: "INT-GOV-EXC-003",
    governanceRuleRef: "INT-GOV-003",
    exceptionKind: "dependency-skip",
    status: "pending",
    required: true,
    description: "Dependency resolution skip pending",
  },
  {
    id: "INT-GOV-EXC-004",
    governanceRuleRef: "INT-GOV-004",
    exceptionKind: "policy-waiver",
    status: "rejected",
    required: true,
    description: "Policy gate waiver rejected",
  },
  {
    id: "INT-GOV-EXC-005",
    governanceRuleRef: "INT-GOV-005",
    exceptionKind: "scan-defer",
    status: "approved",
    required: true,
    description: "Compatibility scan defer template (none active)",
  },
  {
    id: "INT-GOV-EXC-006",
    governanceRuleRef: "INT-GOV-006",
    exceptionKind: "lifecycle-skip",
    status: "rejected",
    required: true,
    description: "Lifecycle transition skip rejected",
  },
  {
    id: "INT-GOV-EXC-007",
    governanceRuleRef: "INT-GOV-007",
    exceptionKind: "audit-waiver",
    status: "pending",
    required: true,
    description: "Compliance audit waiver pending",
  },
  {
    id: "INT-GOV-EXC-008",
    governanceRuleRef: "INT-GOV-008",
    exceptionKind: "signoff-skip",
    status: "rejected",
    required: true,
    description: "Sign-off skip rejected",
  },
];

export const ESCALATION_CATALOG: Escalation[] = [
  {
    id: "INT-GOV-ESC-001",
    governanceRuleRef: "INT-GOV-001",
    escalationLevel: "L1",
    triggerCondition: "catalog incomplete",
    required: true,
    description: "Catalog failure L1 escalation",
  },
  {
    id: "INT-GOV-ESC-002",
    governanceRuleRef: "INT-GOV-002",
    escalationLevel: "L2",
    triggerCondition: "freeze breach detected",
    required: true,
    description: "Freeze breach L2 escalation",
  },
  {
    id: "INT-GOV-ESC-003",
    governanceRuleRef: "INT-GOV-003",
    escalationLevel: "L2",
    triggerCondition: "cyclic dependency detected",
    required: true,
    description: "Dependency cycle L2 escalation",
  },
  {
    id: "INT-GOV-ESC-004",
    governanceRuleRef: "INT-GOV-004",
    escalationLevel: "L1",
    triggerCondition: "policy gate failure",
    required: true,
    description: "Policy gate L1 escalation",
  },
  {
    id: "INT-GOV-ESC-005",
    governanceRuleRef: "INT-GOV-005",
    escalationLevel: "L1",
    triggerCondition: "compatibility mismatch",
    required: true,
    description: "Compatibility mismatch L1 escalation",
  },
  {
    id: "INT-GOV-ESC-006",
    governanceRuleRef: "INT-GOV-006",
    escalationLevel: "L3",
    triggerCondition: "lifecycle transition failure",
    required: true,
    description: "Lifecycle failure L3 escalation",
  },
  {
    id: "INT-GOV-ESC-007",
    governanceRuleRef: "INT-GOV-007",
    escalationLevel: "L2",
    triggerCondition: "compliance audit failure",
    required: true,
    description: "Compliance failure L2 escalation",
  },
  {
    id: "INT-GOV-ESC-008",
    governanceRuleRef: "INT-GOV-008",
    escalationLevel: "L1",
    triggerCondition: "signoff blocked",
    required: true,
    description: "Sign-off blocked L1 escalation",
  },
];

export const GOVERNANCE_AUDIT_TRAIL_CATALOG: AuditTrail[] = [
  {
    id: "INT-GOV-AUD-001",
    governanceRuleRef: "INT-GOV-001",
    event: "intelligence.governance.catalog",
    retention: "365d",
    required: true,
    description: "Global catalog governance audit trail",
  },
  {
    id: "INT-GOV-AUD-002",
    governanceRuleRef: "INT-GOV-002",
    event: "intelligence.governance.freeze",
    retention: "365d",
    required: true,
    description: "Workflow freeze governance audit trail",
  },
  {
    id: "INT-GOV-AUD-003",
    governanceRuleRef: "INT-GOV-003",
    event: "intelligence.governance.dependency",
    retention: "180d",
    required: true,
    description: "Dependency governance audit trail",
  },
  {
    id: "INT-GOV-AUD-004",
    governanceRuleRef: "INT-GOV-004",
    event: "intelligence.governance.policy",
    retention: "180d",
    required: true,
    description: "Policy gate governance audit trail",
  },
  {
    id: "INT-GOV-AUD-005",
    governanceRuleRef: "INT-GOV-005",
    event: "intelligence.governance.compatibility",
    retention: "180d",
    required: true,
    description: "Compatibility governance audit trail",
  },
  {
    id: "INT-GOV-AUD-006",
    governanceRuleRef: "INT-GOV-006",
    event: "intelligence.governance.lifecycle",
    retention: "730d",
    required: true,
    description: "Lifecycle governance audit trail",
  },
  {
    id: "INT-GOV-AUD-007",
    governanceRuleRef: "INT-GOV-007",
    event: "intelligence.governance.compliance",
    retention: "365d",
    required: true,
    description: "Compliance governance audit trail",
  },
  {
    id: "INT-GOV-AUD-008",
    governanceRuleRef: "INT-GOV-008",
    event: "intelligence.governance.signoff",
    retention: "365d",
    required: true,
    description: "Sign-off governance audit trail",
  },
];

export const FREEZE_GATE_CATALOG: FreezeGate[] = [
  {
    id: "INT-GOV-FRZ-001",
    governanceRuleRef: "INT-GOV-001",
    freezeVersion: "v72-intelligence-catalog-freeze-1",
    gateCondition: "catalogReady === true",
    required: true,
    description: "Intelligence catalog freeze gate",
  },
  {
    id: "INT-GOV-FRZ-002",
    governanceRuleRef: "INT-GOV-002",
    freezeVersion: "v71-workflow-freeze-1",
    gateCondition: "upstream workflow frozen",
    required: true,
    description: "V71 workflow baseline freeze gate",
  },
  {
    id: "INT-GOV-FRZ-003",
    governanceRuleRef: "INT-GOV-003",
    freezeVersion: "v72-signal-dependency-freeze-1",
    gateCondition: "dependencyReady === true",
    required: true,
    description: "Signal dependency freeze gate",
  },
  {
    id: "INT-GOV-FRZ-004",
    governanceRuleRef: "INT-GOV-004",
    freezeVersion: "v72-intelligence-policy-freeze-1",
    gateCondition: "policyReady === true",
    required: true,
    description: "Intelligence policy freeze gate",
  },
  {
    id: "INT-GOV-FRZ-005",
    governanceRuleRef: "INT-GOV-005",
    freezeVersion: "v72-intelligence-compatibility-freeze-1",
    gateCondition: "compatibilityReady === true",
    required: true,
    description: "Intelligence compatibility freeze gate",
  },
  {
    id: "INT-GOV-FRZ-006",
    governanceRuleRef: "INT-GOV-006",
    freezeVersion: "v72-intelligence-governance-freeze-1",
    gateCondition: "lifecycle state valid",
    required: true,
    description: "Lifecycle transition freeze gate",
  },
  {
    id: "INT-GOV-FRZ-007",
    governanceRuleRef: "INT-GOV-007",
    freezeVersion: "v72-intelligence-compatibility-freeze-1",
    gateCondition: "compliance audit pass",
    required: true,
    description: "Compliance audit freeze gate",
  },
  {
    id: "INT-GOV-FRZ-008",
    governanceRuleRef: "INT-GOV-008",
    freezeVersion: "v72-intelligence-governance-freeze-1",
    gateCondition: "all upstream gates pass",
    required: true,
    description: "Sign-off freeze gate",
  },
];

export const SIGNOFF_CATALOG: Signoff[] = [
  {
    id: "INT-GOV-SIG-001",
    governanceRuleRef: "INT-GOV-001",
    signoffKind: "catalog",
    passCondition: "readinessScore === 100",
    required: true,
    description: "Catalog governance signoff",
  },
  {
    id: "INT-GOV-SIG-002",
    governanceRuleRef: "INT-GOV-002",
    signoffKind: "freeze",
    passCondition: "workflow baseline signed off",
    required: true,
    description: "Workflow freeze signoff",
  },
  {
    id: "INT-GOV-SIG-003",
    governanceRuleRef: "INT-GOV-003",
    signoffKind: "dependency",
    passCondition: "dependencyReady === true",
    required: true,
    description: "Dependency governance signoff",
  },
  {
    id: "INT-GOV-SIG-004",
    governanceRuleRef: "INT-GOV-004",
    signoffKind: "policy",
    passCondition: "policyReady === true",
    required: true,
    description: "Policy governance signoff",
  },
  {
    id: "INT-GOV-SIG-005",
    governanceRuleRef: "INT-GOV-005",
    signoffKind: "compatibility",
    passCondition: "compatibilityReady === true",
    required: true,
    description: "Compatibility governance signoff",
  },
  {
    id: "INT-GOV-SIG-006",
    governanceRuleRef: "INT-GOV-006",
    signoffKind: "lifecycle",
    passCondition: "lifecycle transition approved",
    required: true,
    description: "Lifecycle governance signoff",
  },
  {
    id: "INT-GOV-SIG-007",
    governanceRuleRef: "INT-GOV-007",
    signoffKind: "compliance",
    passCondition: "compliance audit signed off",
    required: true,
    description: "Compliance governance signoff",
  },
  {
    id: "INT-GOV-SIG-008",
    governanceRuleRef: "INT-GOV-008",
    signoffKind: "final",
    passCondition: "governanceReady === true",
    required: true,
    description: "Final intelligence governance signoff",
  },
];

export function isIntelligenceGovernanceRefsAligned(): boolean {
  const intelligenceIds = new Set(INTELLIGENCE_CATALOG.map((i) => i.id));
  const pairIds = new Set(INTELLIGENCE_VERSION_PAIR_CATALOG.map((p) => p.id));
  const ruleIds = new Set(GOVERNANCE_RULE_CATALOG.map((r) => r.id));
  const reviewIds = new Set(REVIEW_CATALOG.map((r) => r.id));
  const exceptionIds = new Set(GOVERNANCE_EXCEPTION_CATALOG.map((e) => e.id));
  const escalationIds = new Set(ESCALATION_CATALOG.map((e) => e.id));
  const auditIds = new Set(GOVERNANCE_AUDIT_TRAIL_CATALOG.map((a) => a.id));
  const freezeIds = new Set(FREEZE_GATE_CATALOG.map((f) => f.id));
  const signoffIds = new Set(SIGNOFF_CATALOG.map((s) => s.id));

  const rulesAligned = GOVERNANCE_RULE_CATALOG.every((rule) => {
    if (rule.scope === "insight" || rule.scope === "signal") {
      return intelligenceIds.has(rule.scopeRef);
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
    version: V72_INTELLIGENCE_GOVERNANCE_VERSION,
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
    version: V72_INTELLIGENCE_GOVERNANCE_VERSION,
    entryCount: reviews.length,
    catalogComplete,
    reviews,
    summary: [`reviews count=${reviews.length}`, `complete=${catalogComplete}`].join(" "),
  };
}

export function buildGovernanceExceptionManifest(): ExceptionManifest {
  const exceptions = GOVERNANCE_EXCEPTION_CATALOG;
  const statuses = new Set(exceptions.map((e) => e.status));
  const catalogComplete = exceptions.length >= 6 && statuses.size >= 3;

  return {
    version: V72_INTELLIGENCE_GOVERNANCE_VERSION,
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
    version: V72_INTELLIGENCE_GOVERNANCE_VERSION,
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
    version: V72_INTELLIGENCE_GOVERNANCE_VERSION,
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
    version: V72_INTELLIGENCE_GOVERNANCE_VERSION,
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
    version: V72_INTELLIGENCE_GOVERNANCE_VERSION,
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

export function getExceptionByRuleRef(governanceRuleRef: string): Exception | undefined {
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
