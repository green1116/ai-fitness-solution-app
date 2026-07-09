/**
 * V70 P3 — Release policy rules (declarative)
 */
import { RELEASE_CATALOG } from "./release.catalog";
import { RELEASE_DEPENDENCY_CATALOG, RELEASE_NODE_CATALOG } from "./dependency.graph";
import type {
  AuditTrail,
  AuditTrailManifest,
  PolicyException,
  PolicyExceptionManifest,
  PolicyRule,
  PolicyRuleManifest,
  RequiredCheck,
  RequiredCheckManifest,
} from "./release.policy";
import { V70_RELEASE_POLICY_VERSION } from "./release.policy";

export const POLICY_RULE_CATALOG: PolicyRule[] = [
  {
    id: "DLV-POL-001",
    scope: "global",
    scopeRef: "*",
    constraint: "catalog-complete",
    allowed: ["DLV-REL-001", "DLV-REL-002", "DLV-REL-003"],
    blocked: ["incomplete-catalog"],
    requiredCheck: "DLV-CHK-001",
    exception: "DLV-EXC-001",
    enforcement: "gate",
    auditTrail: "DLV-AUD-001",
    required: true,
    description: "Release catalog must be complete before promotion",
  },
  {
    id: "DLV-POL-002",
    scope: "release",
    scopeRef: "DLV-REL-001",
    constraint: "freeze-intact",
    allowed: ["v69-technical-governance-freeze-1"],
    blocked: ["unfrozen-governance"],
    requiredCheck: "DLV-CHK-002",
    exception: "DLV-EXC-002",
    enforcement: "gate",
    auditTrail: "DLV-AUD-002",
    required: true,
    description: "Technical governance baseline must remain frozen",
  },
  {
    id: "DLV-POL-003",
    scope: "release",
    scopeRef: "DLV-REL-003",
    constraint: "dependency-acyclic",
    allowed: ["acyclic-graph"],
    blocked: ["cyclic-dependency"],
    requiredCheck: "DLV-CHK-003",
    exception: "DLV-EXC-003",
    enforcement: "declarative",
    auditTrail: "DLV-AUD-003",
    required: true,
    description: "Application release dependency graph must be acyclic",
  },
  {
    id: "DLV-POL-004",
    scope: "channel",
    scopeRef: "production",
    constraint: "approval-required",
    allowed: ["approved-promotion"],
    blocked: ["unapproved-promotion"],
    requiredCheck: "DLV-CHK-004",
    exception: "DLV-EXC-004",
    enforcement: "gate",
    auditTrail: "DLV-AUD-004",
    required: true,
    description: "Production channel requires approval before release",
  },
  {
    id: "DLV-POL-005",
    scope: "stage",
    scopeRef: "staging",
    constraint: "verify-pass",
    allowed: ["verify-exit-0"],
    blocked: ["verify-failure"],
    requiredCheck: "DLV-CHK-005",
    exception: "DLV-EXC-005",
    enforcement: "gate",
    auditTrail: "DLV-AUD-005",
    required: true,
    description: "Staging stage requires verify pass",
  },
  {
    id: "DLV-POL-006",
    scope: "release",
    scopeRef: "DLV-REL-006",
    constraint: "compatibility-match",
    allowed: ["backward-compatible", "patch-only"],
    blocked: ["breaking-without-approval"],
    requiredCheck: "DLV-CHK-006",
    exception: "DLV-EXC-006",
    enforcement: "declarative",
    auditTrail: "DLV-AUD-006",
    required: true,
    description: "Staging candidate compatibility policy",
  },
  {
    id: "DLV-POL-007",
    scope: "release",
    scopeRef: "DLV-REL-005",
    constraint: "rollback-defined",
    allowed: ["rollback-target-set"],
    blocked: ["missing-rollback"],
    requiredCheck: "DLV-CHK-007",
    exception: "DLV-EXC-007",
    enforcement: "audit-only",
    auditTrail: "DLV-AUD-007",
    required: true,
    description: "Delivery lifecycle release must define rollback target",
  },
  {
    id: "DLV-POL-008",
    scope: "channel",
    scopeRef: "canary",
    constraint: "approval-required",
    allowed: ["canary-approved"],
    blocked: ["canary-blocked"],
    requiredCheck: "DLV-CHK-008",
    exception: "DLV-EXC-008",
    enforcement: "audit-only",
    auditTrail: "DLV-AUD-008",
    required: true,
    description: "Canary channel requires explicit approval",
  },
];

export const REQUIRED_CHECK_CATALOG: RequiredCheck[] = [
  {
    id: "DLV-CHK-001",
    policyRuleRef: "DLV-POL-001",
    checkKind: "manifest",
    passCondition: "catalogComplete === true",
    required: true,
    description: "Catalog completeness check",
  },
  {
    id: "DLV-CHK-002",
    policyRuleRef: "DLV-POL-002",
    checkKind: "freeze",
    passCondition: "freezeVersion declared",
    required: true,
    description: "Governance freeze check",
  },
  {
    id: "DLV-CHK-003",
    policyRuleRef: "DLV-POL-003",
    checkKind: "graph",
    passCondition: "cycleCheck.acyclic === true",
    required: true,
    description: "Dependency acyclic check",
  },
  {
    id: "DLV-CHK-004",
    policyRuleRef: "DLV-POL-004",
    checkKind: "approval",
    passCondition: "approvalStatus === approved",
    required: true,
    description: "Production approval check",
  },
  {
    id: "DLV-CHK-005",
    policyRuleRef: "DLV-POL-005",
    checkKind: "verify",
    passCondition: "verify exit code 0",
    required: true,
    description: "Staging verify check",
  },
  {
    id: "DLV-CHK-006",
    policyRuleRef: "DLV-POL-006",
    checkKind: "compatibility",
    passCondition: "compatibility in allowed set",
    required: true,
    description: "Compatibility match check",
  },
  {
    id: "DLV-CHK-007",
    policyRuleRef: "DLV-POL-007",
    checkKind: "rollback",
    passCondition: "rollbackTarget !== n/a",
    required: true,
    description: "Rollback defined check",
  },
  {
    id: "DLV-CHK-008",
    policyRuleRef: "DLV-POL-008",
    checkKind: "approval",
    passCondition: "canary approval granted",
    required: true,
    description: "Canary approval check",
  },
];

export const POLICY_EXCEPTION_CATALOG: PolicyException[] = [
  {
    id: "DLV-EXC-001",
    policyRuleRef: "DLV-POL-001",
    exceptionKind: "catalog-waiver",
    status: "rejected",
    required: true,
    description: "Catalog incomplete waiver rejected",
  },
  {
    id: "DLV-EXC-002",
    policyRuleRef: "DLV-POL-002",
    exceptionKind: "freeze-bypass",
    status: "rejected",
    required: true,
    description: "Governance freeze bypass rejected",
  },
  {
    id: "DLV-EXC-003",
    policyRuleRef: "DLV-POL-003",
    exceptionKind: "cycle-tolerance",
    status: "rejected",
    required: true,
    description: "Cyclic dependency tolerance rejected",
  },
  {
    id: "DLV-EXC-004",
    policyRuleRef: "DLV-POL-004",
    exceptionKind: "emergency-promotion",
    status: "pending",
    required: true,
    description: "Emergency production promotion pending review",
  },
  {
    id: "DLV-EXC-005",
    policyRuleRef: "DLV-POL-005",
    exceptionKind: "verify-waiver",
    status: "approved",
    required: true,
    description: "Verify waiver template (none active)",
  },
  {
    id: "DLV-EXC-006",
    policyRuleRef: "DLV-POL-006",
    exceptionKind: "breaking-approval",
    status: "pending",
    required: true,
    description: "Breaking change approval pending",
  },
  {
    id: "DLV-EXC-007",
    policyRuleRef: "DLV-POL-007",
    exceptionKind: "rollback-defer",
    status: "rejected",
    required: true,
    description: "Rollback deferral rejected",
  },
  {
    id: "DLV-EXC-008",
    policyRuleRef: "DLV-POL-008",
    exceptionKind: "canary-skip",
    status: "rejected",
    required: true,
    description: "Canary approval skip rejected",
  },
];

export const AUDIT_TRAIL_CATALOG: AuditTrail[] = [
  {
    id: "DLV-AUD-001",
    policyRuleRef: "DLV-POL-001",
    event: "release.catalog.check",
    retention: "365d",
    required: true,
    description: "Catalog policy audit trail",
  },
  {
    id: "DLV-AUD-002",
    policyRuleRef: "DLV-POL-002",
    event: "release.freeze.verify",
    retention: "365d",
    required: true,
    description: "Freeze policy audit trail",
  },
  {
    id: "DLV-AUD-003",
    policyRuleRef: "DLV-POL-003",
    event: "release.dependency.cycle",
    retention: "180d",
    required: true,
    description: "Dependency cycle audit trail",
  },
  {
    id: "DLV-AUD-004",
    policyRuleRef: "DLV-POL-004",
    event: "release.production.approval",
    retention: "730d",
    required: true,
    description: "Production approval audit trail",
  },
  {
    id: "DLV-AUD-005",
    policyRuleRef: "DLV-POL-005",
    event: "release.staging.verify",
    retention: "90d",
    required: true,
    description: "Staging verify audit trail",
  },
  {
    id: "DLV-AUD-006",
    policyRuleRef: "DLV-POL-006",
    event: "release.compatibility.check",
    retention: "180d",
    required: true,
    description: "Compatibility audit trail",
  },
  {
    id: "DLV-AUD-007",
    policyRuleRef: "DLV-POL-007",
    event: "release.rollback.define",
    retention: "365d",
    required: true,
    description: "Rollback definition audit trail",
  },
  {
    id: "DLV-AUD-008",
    policyRuleRef: "DLV-POL-008",
    event: "release.canary.approval",
    retention: "90d",
    required: true,
    description: "Canary approval audit trail",
  },
];

export function isReleasePolicyRefsAligned(): boolean {
  const releaseIds = new Set(RELEASE_CATALOG.map((r) => r.id));
  const nodeIds = new Set(RELEASE_NODE_CATALOG.map((n) => n.id));
  const ruleIds = new Set(POLICY_RULE_CATALOG.map((r) => r.id));
  const checkIds = new Set(REQUIRED_CHECK_CATALOG.map((c) => c.id));
  const exceptionIds = new Set(POLICY_EXCEPTION_CATALOG.map((e) => e.id));
  const auditIds = new Set(AUDIT_TRAIL_CATALOG.map((a) => a.id));

  const rulesAligned = POLICY_RULE_CATALOG.every((rule) => {
    if (rule.scope === "release") return releaseIds.has(rule.scopeRef);
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
    RELEASE_DEPENDENCY_CATALOG.length >= 6 &&
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
    version: V70_RELEASE_POLICY_VERSION,
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
    version: V70_RELEASE_POLICY_VERSION,
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
    version: V70_RELEASE_POLICY_VERSION,
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
    version: V70_RELEASE_POLICY_VERSION,
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
