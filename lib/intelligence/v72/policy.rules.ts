/**
 * V72 P3 — Intelligence policy rules (declarative)
 */
import { INTELLIGENCE_CATALOG } from "./intelligence.catalog";
import { SIGNAL_DEPENDENCY_CATALOG, SIGNAL_NODE_CATALOG } from "./dependency.graph";
import type {
  AuditTrail,
  AuditTrailManifest,
  PolicyException,
  PolicyExceptionManifest,
  PolicyRule,
  PolicyRuleManifest,
  RequiredCheck,
  RequiredCheckManifest,
} from "./intelligence.policy";
import { V72_INTELLIGENCE_POLICY_VERSION } from "./intelligence.policy";

export const POLICY_RULE_CATALOG: PolicyRule[] = [
  {
    id: "INT-POL-001",
    scope: "global",
    scopeRef: "*",
    constraint: "catalog-complete",
    allowed: ["INT-001", "INT-002", "INT-003"],
    blocked: ["incomplete-intelligence-catalog"],
    requiredCheck: "INT-CHK-001",
    exception: "INT-EXC-001",
    enforcement: "gate",
    auditTrail: "INT-AUD-001",
    required: true,
    description: "Intelligence catalog must be complete before insight evaluation",
  },
  {
    id: "INT-POL-002",
    scope: "insight",
    scopeRef: "INT-001",
    constraint: "source-valid",
    allowed: ["v71-workflow-freeze-1"],
    blocked: ["invalid-upstream-source"],
    requiredCheck: "INT-CHK-002",
    exception: "INT-EXC-002",
    enforcement: "gate",
    auditTrail: "INT-AUD-002",
    required: true,
    description: "Orchestration baseline insight must reference valid upstream source",
  },
  {
    id: "INT-POL-003",
    scope: "insight",
    scopeRef: "INT-002",
    constraint: "dependency-acyclic",
    allowed: ["acyclic-signal-graph"],
    blocked: ["cyclic-signal-dependency"],
    requiredCheck: "INT-CHK-003",
    exception: "INT-EXC-003",
    enforcement: "declarative",
    auditTrail: "INT-AUD-003",
    required: true,
    description: "Signal dependency graph must be acyclic",
  },
  {
    id: "INT-POL-004",
    scope: "signal",
    scopeRef: "workflow-dependency-acyclic",
    constraint: "verify-pass",
    allowed: ["verify-exit-0"],
    blocked: ["verify-failure"],
    requiredCheck: "INT-CHK-004",
    exception: "INT-EXC-004",
    enforcement: "gate",
    auditTrail: "INT-AUD-004",
    required: true,
    description: "Dependency acyclic signal requires verify pass",
  },
  {
    id: "INT-POL-005",
    scope: "metric",
    scopeRef: "policyReady",
    constraint: "confidence-threshold",
    allowed: ["high", "medium"],
    blocked: ["low-confidence-unapproved"],
    requiredCheck: "INT-CHK-005",
    exception: "INT-EXC-005",
    enforcement: "gate",
    auditTrail: "INT-AUD-005",
    required: true,
    description: "Policy compliance metric requires confidence threshold",
  },
  {
    id: "INT-POL-006",
    scope: "insight",
    scopeRef: "INT-004",
    constraint: "trend-stable",
    allowed: ["stable", "up"],
    blocked: ["volatile-unreviewed"],
    requiredCheck: "INT-CHK-006",
    exception: "INT-EXC-006",
    enforcement: "declarative",
    auditTrail: "INT-AUD-006",
    required: true,
    description: "Compatibility coverage insight must have stable trend",
  },
  {
    id: "INT-POL-007",
    scope: "insight",
    scopeRef: "INT-005",
    constraint: "anomaly-detected",
    allowed: ["anomaly-reviewed"],
    blocked: ["unreviewed-anomaly"],
    requiredCheck: "INT-CHK-007",
    exception: "INT-EXC-007",
    enforcement: "audit-only",
    auditTrail: "INT-AUD-007",
    required: true,
    description: "Governance risk insight with anomaly requires review",
  },
  {
    id: "INT-POL-008",
    scope: "metric",
    scopeRef: "catalogReady",
    constraint: "severity-gate",
    allowed: ["low", "medium"],
    blocked: ["critical-unapproved"],
    requiredCheck: "INT-CHK-008",
    exception: "INT-EXC-008",
    enforcement: "audit-only",
    auditTrail: "INT-AUD-008",
    required: true,
    description: "Intelligence foundation metric severity gate",
  },
];

export const REQUIRED_CHECK_CATALOG: RequiredCheck[] = [
  {
    id: "INT-CHK-001",
    policyRuleRef: "INT-POL-001",
    checkKind: "manifest",
    passCondition: "catalogComplete === true",
    required: true,
    description: "Intelligence catalog completeness check",
  },
  {
    id: "INT-CHK-002",
    policyRuleRef: "INT-POL-002",
    checkKind: "source",
    passCondition: "source references v71-workflow-freeze-1",
    required: true,
    description: "Upstream workflow freeze source check",
  },
  {
    id: "INT-CHK-003",
    policyRuleRef: "INT-POL-003",
    checkKind: "graph",
    passCondition: "cycleCheck.acyclic === true",
    required: true,
    description: "Signal dependency acyclic check",
  },
  {
    id: "INT-CHK-004",
    policyRuleRef: "INT-POL-004",
    checkKind: "verify",
    passCondition: "verify exit code 0",
    required: true,
    description: "Dependency signal verify check",
  },
  {
    id: "INT-CHK-005",
    policyRuleRef: "INT-POL-005",
    checkKind: "confidence",
    passCondition: "confidence in allowed set",
    required: true,
    description: "Confidence threshold check",
  },
  {
    id: "INT-CHK-006",
    policyRuleRef: "INT-POL-006",
    checkKind: "trend",
    passCondition: "trend in stable or up",
    required: true,
    description: "Trend stability check",
  },
  {
    id: "INT-CHK-007",
    policyRuleRef: "INT-POL-007",
    checkKind: "anomaly",
    passCondition: "anomaly reviewed or false",
    required: true,
    description: "Anomaly review check",
  },
  {
    id: "INT-CHK-008",
    policyRuleRef: "INT-POL-008",
    checkKind: "severity",
    passCondition: "severity in allowed set",
    required: true,
    description: "Severity gate check",
  },
];

export const POLICY_EXCEPTION_CATALOG: PolicyException[] = [
  {
    id: "INT-EXC-001",
    policyRuleRef: "INT-POL-001",
    exceptionKind: "catalog-waiver",
    status: "rejected",
    required: true,
    description: "Intelligence catalog incomplete waiver rejected",
  },
  {
    id: "INT-EXC-002",
    policyRuleRef: "INT-POL-002",
    exceptionKind: "source-bypass",
    status: "rejected",
    required: true,
    description: "Invalid source bypass rejected",
  },
  {
    id: "INT-EXC-003",
    policyRuleRef: "INT-POL-003",
    exceptionKind: "cycle-tolerance",
    status: "rejected",
    required: true,
    description: "Cyclic signal dependency tolerance rejected",
  },
  {
    id: "INT-EXC-004",
    policyRuleRef: "INT-POL-004",
    exceptionKind: "verify-waiver",
    status: "pending",
    required: true,
    description: "Verify waiver pending review",
  },
  {
    id: "INT-EXC-005",
    policyRuleRef: "INT-POL-005",
    exceptionKind: "confidence-waiver",
    status: "approved",
    required: true,
    description: "Confidence waiver template (none active)",
  },
  {
    id: "INT-EXC-006",
    policyRuleRef: "INT-POL-006",
    exceptionKind: "trend-defer",
    status: "pending",
    required: true,
    description: "Trend deferral pending review",
  },
  {
    id: "INT-EXC-007",
    policyRuleRef: "INT-POL-007",
    exceptionKind: "anomaly-skip",
    status: "rejected",
    required: true,
    description: "Anomaly review skip rejected",
  },
  {
    id: "INT-EXC-008",
    policyRuleRef: "INT-POL-008",
    exceptionKind: "severity-skip",
    status: "rejected",
    required: true,
    description: "Severity gate skip rejected",
  },
];

export const AUDIT_TRAIL_CATALOG: AuditTrail[] = [
  {
    id: "INT-AUD-001",
    policyRuleRef: "INT-POL-001",
    event: "intelligence.catalog.check",
    retention: "365d",
    required: true,
    description: "Intelligence catalog policy audit trail",
  },
  {
    id: "INT-AUD-002",
    policyRuleRef: "INT-POL-002",
    event: "intelligence.source.verify",
    retention: "365d",
    required: true,
    description: "Upstream source policy audit trail",
  },
  {
    id: "INT-AUD-003",
    policyRuleRef: "INT-POL-003",
    event: "intelligence.dependency.cycle",
    retention: "180d",
    required: true,
    description: "Signal dependency cycle audit trail",
  },
  {
    id: "INT-AUD-004",
    policyRuleRef: "INT-POL-004",
    event: "intelligence.signal.verify",
    retention: "90d",
    required: true,
    description: "Signal verify audit trail",
  },
  {
    id: "INT-AUD-005",
    policyRuleRef: "INT-POL-005",
    event: "intelligence.confidence.gate",
    retention: "180d",
    required: true,
    description: "Confidence threshold audit trail",
  },
  {
    id: "INT-AUD-006",
    policyRuleRef: "INT-POL-006",
    event: "intelligence.trend.check",
    retention: "180d",
    required: true,
    description: "Trend stability audit trail",
  },
  {
    id: "INT-AUD-007",
    policyRuleRef: "INT-POL-007",
    event: "intelligence.anomaly.review",
    retention: "365d",
    required: true,
    description: "Anomaly review audit trail",
  },
  {
    id: "INT-AUD-008",
    policyRuleRef: "INT-POL-008",
    event: "intelligence.severity.gate",
    retention: "90d",
    required: true,
    description: "Severity gate audit trail",
  },
];

export function isIntelligencePolicyRefsAligned(): boolean {
  const insightIds = new Set(INTELLIGENCE_CATALOG.map((i) => i.id));
  const nodeIds = new Set(SIGNAL_NODE_CATALOG.map((n) => n.id));
  const ruleIds = new Set(POLICY_RULE_CATALOG.map((r) => r.id));
  const checkIds = new Set(REQUIRED_CHECK_CATALOG.map((c) => c.id));
  const exceptionIds = new Set(POLICY_EXCEPTION_CATALOG.map((e) => e.id));
  const auditIds = new Set(AUDIT_TRAIL_CATALOG.map((a) => a.id));

  const rulesAligned = POLICY_RULE_CATALOG.every((rule) => {
    if (rule.scope === "insight") return insightIds.has(rule.scopeRef);
    return true;
  });

  const checksAligned = REQUIRED_CHECK_CATALOG.every((c) =>
    ruleIds.has(c.policyRuleRef),
  );
  const exceptionsAligned = POLICY_EXCEPTION_CATALOG.every((e) =>
    ruleIds.has(e.policyRuleRef),
  );
  const auditsAligned = AUDIT_TRAIL_CATALOG.every((a) =>
    ruleIds.has(a.policyRuleRef),
  );

  const ruleRefsComplete = POLICY_RULE_CATALOG.every(
    (rule) =>
      checkIds.has(rule.requiredCheck) &&
      exceptionIds.has(rule.exception) &&
      auditIds.has(rule.auditTrail),
  );

  const coverageComplete =
    POLICY_RULE_CATALOG.every((rule) =>
      REQUIRED_CHECK_CATALOG.some((c) => c.policyRuleRef === rule.id),
    ) &&
    POLICY_RULE_CATALOG.every((rule) =>
      POLICY_EXCEPTION_CATALOG.some((e) => e.policyRuleRef === rule.id),
    ) &&
    POLICY_RULE_CATALOG.every((rule) =>
      AUDIT_TRAIL_CATALOG.some((a) => a.policyRuleRef === rule.id),
    ) &&
    SIGNAL_DEPENDENCY_CATALOG.length >= 6 &&
    nodeIds.size >= 6;

  return (
    rulesAligned &&
    checksAligned &&
    exceptionsAligned &&
    auditsAligned &&
    ruleRefsComplete &&
    coverageComplete
  );
}

export function buildPolicyRuleManifest(): PolicyRuleManifest {
  const rules = POLICY_RULE_CATALOG;
  const scopes = new Set(rules.map((r) => r.scope));
  const catalogComplete = rules.length >= 6 && scopes.size >= 3;

  return {
    version: V72_INTELLIGENCE_POLICY_VERSION,
    ruleCount: rules.length,
    scopeCount: scopes.size,
    catalogComplete,
    rules,
    summary: [
      `policy-rules count=${rules.length}`,
      `scopes=${scopes.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildRequiredCheckManifest(): RequiredCheckManifest {
  const checks = REQUIRED_CHECK_CATALOG;
  const catalogComplete = checks.length >= 6;

  return {
    version: V72_INTELLIGENCE_POLICY_VERSION,
    entryCount: checks.length,
    catalogComplete,
    checks,
    summary: [
      `required-checks count=${checks.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPolicyExceptionManifest(): PolicyExceptionManifest {
  const exceptions = POLICY_EXCEPTION_CATALOG;
  const statuses = new Set(exceptions.map((e) => e.status));
  const catalogComplete = exceptions.length >= 6 && statuses.size >= 3;

  return {
    version: V72_INTELLIGENCE_POLICY_VERSION,
    entryCount: exceptions.length,
    statusCount: statuses.size,
    catalogComplete,
    exceptions,
    summary: [
      `policy-exceptions count=${exceptions.length}`,
      `statuses=${statuses.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildAuditTrailManifest(): AuditTrailManifest {
  const trails = AUDIT_TRAIL_CATALOG;
  const catalogComplete = trails.length >= 6;

  return {
    version: V72_INTELLIGENCE_POLICY_VERSION,
    entryCount: trails.length,
    catalogComplete,
    trails,
    summary: [
      `audit-trails count=${trails.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getPolicyRuleById(id: string): PolicyRule | undefined {
  return POLICY_RULE_CATALOG.find((r) => r.id === id);
}

export function getPolicyRulesByScope(scope: PolicyRule["scope"]): PolicyRule[] {
  return POLICY_RULE_CATALOG.filter((r) => r.scope === scope);
}

export function getRequiredCheckByRuleRef(policyRuleRef: string): RequiredCheck | undefined {
  return REQUIRED_CHECK_CATALOG.find((c) => c.policyRuleRef === policyRuleRef);
}

export function getExceptionByRuleRef(policyRuleRef: string): PolicyException | undefined {
  return POLICY_EXCEPTION_CATALOG.find((e) => e.policyRuleRef === policyRuleRef);
}

export function getAuditTrailByRuleRef(policyRuleRef: string): AuditTrail | undefined {
  return AUDIT_TRAIL_CATALOG.find((a) => a.policyRuleRef === policyRuleRef);
}

export function computeDeclarativeEnforcementBlock(input: {
  enforcement: PolicyRule["enforcement"];
  blocked: string[];
}): boolean {
  return input.enforcement === "gate" && input.blocked.length > 0;
}
