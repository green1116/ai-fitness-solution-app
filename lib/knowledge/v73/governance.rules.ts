/**
 * V73 P5 — Knowledge governance rules (declarative)
 */
import { KNOWLEDGE_VERSION_PAIR_CATALOG } from "./compatibility.matrix";
import { KNOWLEDGE_CATALOG } from "./knowledge.catalog";
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
} from "./knowledge.governance";
import { V73_KNOWLEDGE_GOVERNANCE_VERSION } from "./knowledge.governance";

export const GOVERNANCE_RULE_CATALOG: GovernanceRule[] = [
  {
    id: "KNW-GOV-001",
    scope: "global",
    scopeRef: "*",
    approval: "approved",
    review: "KNW-GOV-REV-001",
    exception: "KNW-GOV-EXC-001",
    escalation: "KNW-GOV-ESC-001",
    auditTrail: "KNW-GOV-AUD-001",
    freezeGate: "KNW-GOV-FRZ-001",
    signoff: "KNW-GOV-SIG-001",
    riskLevel: "medium",
    compatibilityCheck: "KNW-VPX-001",
    required: true,
    description: "Global knowledge catalog governance rule",
  },
  {
    id: "KNW-GOV-002",
    scope: "document",
    scopeRef: "KNW-001",
    approval: "approved",
    review: "KNW-GOV-REV-002",
    exception: "KNW-GOV-EXC-002",
    escalation: "KNW-GOV-ESC-002",
    auditTrail: "KNW-GOV-AUD-002",
    freezeGate: "KNW-GOV-FRZ-002",
    signoff: "KNW-GOV-SIG-002",
    riskLevel: "high",
    compatibilityCheck: "KNW-VPX-001",
    required: true,
    description: "Intelligence baseline document governance rule",
  },
  {
    id: "KNW-GOV-003",
    scope: "topic",
    scopeRef: "KNW-002",
    approval: "required",
    review: "KNW-GOV-REV-003",
    exception: "KNW-GOV-EXC-003",
    escalation: "KNW-GOV-ESC-003",
    auditTrail: "KNW-GOV-AUD-003",
    freezeGate: "KNW-GOV-FRZ-003",
    signoff: "KNW-GOV-SIG-003",
    riskLevel: "high",
    compatibilityCheck: "KNW-VPX-002",
    required: true,
    description: "Dependency acyclic topic governance rule",
  },
  {
    id: "KNW-GOV-004",
    scope: "document",
    scopeRef: "KNW-003",
    approval: "required",
    review: "KNW-GOV-REV-004",
    exception: "KNW-GOV-EXC-004",
    escalation: "KNW-GOV-ESC-004",
    auditTrail: "KNW-GOV-AUD-004",
    freezeGate: "KNW-GOV-FRZ-004",
    signoff: "KNW-GOV-SIG-004",
    riskLevel: "medium",
    compatibilityCheck: "KNW-VPX-003",
    required: true,
    description: "Policy gate document governance rule",
  },
  {
    id: "KNW-GOV-005",
    scope: "category",
    scopeRef: "matrixComplete",
    approval: "approved",
    review: "KNW-GOV-REV-005",
    exception: "KNW-GOV-EXC-005",
    escalation: "KNW-GOV-ESC-005",
    auditTrail: "KNW-GOV-AUD-005",
    freezeGate: "KNW-GOV-FRZ-005",
    signoff: "KNW-GOV-SIG-005",
    riskLevel: "medium",
    compatibilityCheck: "KNW-VPX-005",
    required: true,
    description: "Compatibility matrix category governance rule",
  },
  {
    id: "KNW-GOV-006",
    scope: "topic",
    scopeRef: "KNW-005",
    approval: "required",
    review: "KNW-GOV-REV-006",
    exception: "KNW-GOV-EXC-006",
    escalation: "KNW-GOV-ESC-006",
    auditTrail: "KNW-GOV-AUD-006",
    freezeGate: "KNW-GOV-FRZ-006",
    signoff: "KNW-GOV-SIG-006",
    riskLevel: "critical",
    compatibilityCheck: "KNW-VPX-007",
    required: true,
    description: "Governance risk escalation topic governance rule",
  },
  {
    id: "KNW-GOV-007",
    scope: "category",
    scopeRef: "compliance-audit",
    approval: "required",
    review: "KNW-GOV-REV-007",
    exception: "KNW-GOV-EXC-007",
    escalation: "KNW-GOV-ESC-007",
    auditTrail: "KNW-GOV-AUD-007",
    freezeGate: "KNW-GOV-FRZ-007",
    signoff: "KNW-GOV-SIG-007",
    riskLevel: "high",
    compatibilityCheck: "KNW-VPX-008",
    required: true,
    description: "Compliance audit category governance rule",
  },
  {
    id: "KNW-GOV-008",
    scope: "document",
    scopeRef: "KNW-008",
    approval: "waived",
    review: "KNW-GOV-REV-008",
    exception: "KNW-GOV-EXC-008",
    escalation: "KNW-GOV-ESC-008",
    auditTrail: "KNW-GOV-AUD-008",
    freezeGate: "KNW-GOV-FRZ-008",
    signoff: "KNW-GOV-SIG-008",
    riskLevel: "low",
    compatibilityCheck: "KNW-VPX-004",
    required: true,
    description: "Foundation catalog document governance rule",
  },
];

export const REVIEW_CATALOG: Review[] = [
  {
    id: "KNW-GOV-REV-001",
    governanceRuleRef: "KNW-GOV-001",
    reviewKind: "catalog",
    passCondition: "knowledge catalog complete",
    required: true,
    description: "Global catalog review",
  },
  {
    id: "KNW-GOV-REV-002",
    governanceRuleRef: "KNW-GOV-002",
    reviewKind: "freeze",
    passCondition: "v72-intelligence-freeze-1 intact",
    required: true,
    description: "Intelligence freeze baseline review",
  },
  {
    id: "KNW-GOV-REV-003",
    governanceRuleRef: "KNW-GOV-003",
    reviewKind: "graph",
    passCondition: "knowledge dependency acyclic",
    required: true,
    description: "Dependency graph review",
  },
  {
    id: "KNW-GOV-REV-004",
    governanceRuleRef: "KNW-GOV-004",
    reviewKind: "policy",
    passCondition: "knowledge policy ready",
    required: true,
    description: "Policy gate review",
  },
  {
    id: "KNW-GOV-REV-005",
    governanceRuleRef: "KNW-GOV-005",
    reviewKind: "matrix",
    passCondition: "compatibility matrix complete",
    required: true,
    description: "Compatibility matrix review",
  },
  {
    id: "KNW-GOV-REV-006",
    governanceRuleRef: "KNW-GOV-006",
    reviewKind: "lifecycle",
    passCondition: "lifecycle state valid",
    required: true,
    description: "Lifecycle transition review",
  },
  {
    id: "KNW-GOV-REV-007",
    governanceRuleRef: "KNW-GOV-007",
    reviewKind: "compliance",
    passCondition: "compliance audit pass",
    required: true,
    description: "Compliance audit review",
  },
  {
    id: "KNW-GOV-REV-008",
    governanceRuleRef: "KNW-GOV-008",
    reviewKind: "signoff",
    passCondition: "all upstream governance ready",
    required: true,
    description: "Foundation catalog signoff review",
  },
];

export const GOVERNANCE_EXCEPTION_CATALOG: Exception[] = [
  {
    id: "KNW-GOV-EXC-001",
    governanceRuleRef: "KNW-GOV-001",
    exceptionKind: "catalog-waiver",
    status: "rejected",
    required: true,
    description: "Knowledge catalog incomplete waiver rejected",
  },
  {
    id: "KNW-GOV-EXC-002",
    governanceRuleRef: "KNW-GOV-002",
    exceptionKind: "freeze-bypass",
    status: "rejected",
    required: true,
    description: "Intelligence freeze bypass rejected",
  },
  {
    id: "KNW-GOV-EXC-003",
    governanceRuleRef: "KNW-GOV-003",
    exceptionKind: "dependency-skip",
    status: "pending",
    required: true,
    description: "Dependency resolution skip pending",
  },
  {
    id: "KNW-GOV-EXC-004",
    governanceRuleRef: "KNW-GOV-004",
    exceptionKind: "policy-waiver",
    status: "rejected",
    required: true,
    description: "Policy gate waiver rejected",
  },
  {
    id: "KNW-GOV-EXC-005",
    governanceRuleRef: "KNW-GOV-005",
    exceptionKind: "scan-defer",
    status: "approved",
    required: true,
    description: "Compatibility scan defer template (none active)",
  },
  {
    id: "KNW-GOV-EXC-006",
    governanceRuleRef: "KNW-GOV-006",
    exceptionKind: "lifecycle-skip",
    status: "rejected",
    required: true,
    description: "Lifecycle transition skip rejected",
  },
  {
    id: "KNW-GOV-EXC-007",
    governanceRuleRef: "KNW-GOV-007",
    exceptionKind: "audit-waiver",
    status: "pending",
    required: true,
    description: "Compliance audit waiver pending",
  },
  {
    id: "KNW-GOV-EXC-008",
    governanceRuleRef: "KNW-GOV-008",
    exceptionKind: "signoff-skip",
    status: "rejected",
    required: true,
    description: "Sign-off skip rejected",
  },
];

export const ESCALATION_CATALOG: Escalation[] = [
  {
    id: "KNW-GOV-ESC-001",
    governanceRuleRef: "KNW-GOV-001",
    escalationLevel: "L1",
    triggerCondition: "catalog incomplete",
    required: true,
    description: "Catalog failure L1 escalation",
  },
  {
    id: "KNW-GOV-ESC-002",
    governanceRuleRef: "KNW-GOV-002",
    escalationLevel: "L2",
    triggerCondition: "freeze breach detected",
    required: true,
    description: "Freeze breach L2 escalation",
  },
  {
    id: "KNW-GOV-ESC-003",
    governanceRuleRef: "KNW-GOV-003",
    escalationLevel: "L2",
    triggerCondition: "cyclic dependency detected",
    required: true,
    description: "Dependency cycle L2 escalation",
  },
  {
    id: "KNW-GOV-ESC-004",
    governanceRuleRef: "KNW-GOV-004",
    escalationLevel: "L1",
    triggerCondition: "policy gate failure",
    required: true,
    description: "Policy gate L1 escalation",
  },
  {
    id: "KNW-GOV-ESC-005",
    governanceRuleRef: "KNW-GOV-005",
    escalationLevel: "L1",
    triggerCondition: "compatibility mismatch",
    required: true,
    description: "Compatibility mismatch L1 escalation",
  },
  {
    id: "KNW-GOV-ESC-006",
    governanceRuleRef: "KNW-GOV-006",
    escalationLevel: "L3",
    triggerCondition: "lifecycle transition failure",
    required: true,
    description: "Lifecycle failure L3 escalation",
  },
  {
    id: "KNW-GOV-ESC-007",
    governanceRuleRef: "KNW-GOV-007",
    escalationLevel: "L2",
    triggerCondition: "compliance audit failure",
    required: true,
    description: "Compliance failure L2 escalation",
  },
  {
    id: "KNW-GOV-ESC-008",
    governanceRuleRef: "KNW-GOV-008",
    escalationLevel: "L1",
    triggerCondition: "signoff blocked",
    required: true,
    description: "Sign-off blocked L1 escalation",
  },
];

export const GOVERNANCE_AUDIT_TRAIL_CATALOG: AuditTrail[] = [
  {
    id: "KNW-GOV-AUD-001",
    governanceRuleRef: "KNW-GOV-001",
    event: "knowledge.governance.catalog",
    retention: "365d",
    required: true,
    description: "Global catalog governance audit trail",
  },
  {
    id: "KNW-GOV-AUD-002",
    governanceRuleRef: "KNW-GOV-002",
    event: "knowledge.governance.freeze",
    retention: "365d",
    required: true,
    description: "Intelligence freeze governance audit trail",
  },
  {
    id: "KNW-GOV-AUD-003",
    governanceRuleRef: "KNW-GOV-003",
    event: "knowledge.governance.dependency",
    retention: "180d",
    required: true,
    description: "Dependency governance audit trail",
  },
  {
    id: "KNW-GOV-AUD-004",
    governanceRuleRef: "KNW-GOV-004",
    event: "knowledge.governance.policy",
    retention: "180d",
    required: true,
    description: "Policy gate governance audit trail",
  },
  {
    id: "KNW-GOV-AUD-005",
    governanceRuleRef: "KNW-GOV-005",
    event: "knowledge.governance.compatibility",
    retention: "180d",
    required: true,
    description: "Compatibility governance audit trail",
  },
  {
    id: "KNW-GOV-AUD-006",
    governanceRuleRef: "KNW-GOV-006",
    event: "knowledge.governance.lifecycle",
    retention: "730d",
    required: true,
    description: "Lifecycle governance audit trail",
  },
  {
    id: "KNW-GOV-AUD-007",
    governanceRuleRef: "KNW-GOV-007",
    event: "knowledge.governance.compliance",
    retention: "365d",
    required: true,
    description: "Compliance governance audit trail",
  },
  {
    id: "KNW-GOV-AUD-008",
    governanceRuleRef: "KNW-GOV-008",
    event: "knowledge.governance.signoff",
    retention: "365d",
    required: true,
    description: "Sign-off governance audit trail",
  },
];

export const FREEZE_GATE_CATALOG: FreezeGate[] = [
  {
    id: "KNW-GOV-FRZ-001",
    governanceRuleRef: "KNW-GOV-001",
    freezeVersion: "v73-knowledge-catalog-freeze-1",
    gateCondition: "catalogReady === true",
    required: true,
    description: "Knowledge catalog freeze gate",
  },
  {
    id: "KNW-GOV-FRZ-002",
    governanceRuleRef: "KNW-GOV-002",
    freezeVersion: "v72-intelligence-freeze-1",
    gateCondition: "upstream intelligence frozen",
    required: true,
    description: "V72 intelligence baseline freeze gate",
  },
  {
    id: "KNW-GOV-FRZ-003",
    governanceRuleRef: "KNW-GOV-003",
    freezeVersion: "v73-knowledge-dependency-freeze-1",
    gateCondition: "dependencyReady === true",
    required: true,
    description: "Knowledge dependency freeze gate",
  },
  {
    id: "KNW-GOV-FRZ-004",
    governanceRuleRef: "KNW-GOV-004",
    freezeVersion: "v73-knowledge-policy-freeze-1",
    gateCondition: "policyReady === true",
    required: true,
    description: "Knowledge policy freeze gate",
  },
  {
    id: "KNW-GOV-FRZ-005",
    governanceRuleRef: "KNW-GOV-005",
    freezeVersion: "v73-knowledge-compatibility-freeze-1",
    gateCondition: "compatibilityReady === true",
    required: true,
    description: "Knowledge compatibility freeze gate",
  },
  {
    id: "KNW-GOV-FRZ-006",
    governanceRuleRef: "KNW-GOV-006",
    freezeVersion: "v73-knowledge-governance-freeze-1",
    gateCondition: "lifecycle state valid",
    required: true,
    description: "Lifecycle transition freeze gate",
  },
  {
    id: "KNW-GOV-FRZ-007",
    governanceRuleRef: "KNW-GOV-007",
    freezeVersion: "v73-knowledge-compatibility-freeze-1",
    gateCondition: "compliance audit pass",
    required: true,
    description: "Compliance audit freeze gate",
  },
  {
    id: "KNW-GOV-FRZ-008",
    governanceRuleRef: "KNW-GOV-008",
    freezeVersion: "v73-knowledge-governance-freeze-1",
    gateCondition: "all upstream gates pass",
    required: true,
    description: "Sign-off freeze gate",
  },
];

export const SIGNOFF_CATALOG: Signoff[] = [
  {
    id: "KNW-GOV-SIG-001",
    governanceRuleRef: "KNW-GOV-001",
    signoffKind: "catalog",
    passCondition: "readinessScore === 100",
    required: true,
    description: "Catalog governance signoff",
  },
  {
    id: "KNW-GOV-SIG-002",
    governanceRuleRef: "KNW-GOV-002",
    signoffKind: "freeze",
    passCondition: "intelligence baseline signed off",
    required: true,
    description: "Intelligence freeze signoff",
  },
  {
    id: "KNW-GOV-SIG-003",
    governanceRuleRef: "KNW-GOV-003",
    signoffKind: "dependency",
    passCondition: "dependencyReady === true",
    required: true,
    description: "Dependency governance signoff",
  },
  {
    id: "KNW-GOV-SIG-004",
    governanceRuleRef: "KNW-GOV-004",
    signoffKind: "policy",
    passCondition: "policyReady === true",
    required: true,
    description: "Policy governance signoff",
  },
  {
    id: "KNW-GOV-SIG-005",
    governanceRuleRef: "KNW-GOV-005",
    signoffKind: "compatibility",
    passCondition: "compatibilityReady === true",
    required: true,
    description: "Compatibility governance signoff",
  },
  {
    id: "KNW-GOV-SIG-006",
    governanceRuleRef: "KNW-GOV-006",
    signoffKind: "lifecycle",
    passCondition: "lifecycle transition approved",
    required: true,
    description: "Lifecycle governance signoff",
  },
  {
    id: "KNW-GOV-SIG-007",
    governanceRuleRef: "KNW-GOV-007",
    signoffKind: "compliance",
    passCondition: "compliance audit signed off",
    required: true,
    description: "Compliance governance signoff",
  },
  {
    id: "KNW-GOV-SIG-008",
    governanceRuleRef: "KNW-GOV-008",
    signoffKind: "final",
    passCondition: "governanceReady === true",
    required: true,
    description: "Final knowledge governance signoff",
  },
];

export function isKnowledgeGovernanceRefsAligned(): boolean {
  const knowledgeIds = new Set(KNOWLEDGE_CATALOG.map((k) => k.id));
  const pairIds = new Set(KNOWLEDGE_VERSION_PAIR_CATALOG.map((p) => p.id));
  const ruleIds = new Set(GOVERNANCE_RULE_CATALOG.map((r) => r.id));
  const reviewIds = new Set(REVIEW_CATALOG.map((r) => r.id));
  const exceptionIds = new Set(GOVERNANCE_EXCEPTION_CATALOG.map((e) => e.id));
  const escalationIds = new Set(ESCALATION_CATALOG.map((e) => e.id));
  const auditIds = new Set(GOVERNANCE_AUDIT_TRAIL_CATALOG.map((a) => a.id));
  const freezeIds = new Set(FREEZE_GATE_CATALOG.map((f) => f.id));
  const signoffIds = new Set(SIGNOFF_CATALOG.map((s) => s.id));

  const rulesAligned = GOVERNANCE_RULE_CATALOG.every((rule) => {
    if (rule.scope === "document" || rule.scope === "topic") {
      return knowledgeIds.has(rule.scopeRef);
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
    version: V73_KNOWLEDGE_GOVERNANCE_VERSION,
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
    version: V73_KNOWLEDGE_GOVERNANCE_VERSION,
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
    version: V73_KNOWLEDGE_GOVERNANCE_VERSION,
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
    version: V73_KNOWLEDGE_GOVERNANCE_VERSION,
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
    version: V73_KNOWLEDGE_GOVERNANCE_VERSION,
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
    version: V73_KNOWLEDGE_GOVERNANCE_VERSION,
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
    version: V73_KNOWLEDGE_GOVERNANCE_VERSION,
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
