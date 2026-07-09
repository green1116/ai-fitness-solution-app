/**
 * V73 P3 — Knowledge policy rules (declarative)
 */
import { KNOWLEDGE_DEPENDENCY_CATALOG, KNOWLEDGE_NODE_CATALOG } from "./dependency.graph";
import { KNOWLEDGE_CATALOG } from "./knowledge.catalog";
import type {
  AuditTrail,
  AuditTrailManifest,
  Exception,
  ExceptionManifest,
  PolicyRule,
  PolicyRuleManifest,
  RequiredCheck,
  RequiredCheckManifest,
} from "./knowledge.policy";
import { V73_KNOWLEDGE_POLICY_VERSION } from "./knowledge.policy";

export const POLICY_RULE_CATALOG: PolicyRule[] = [
  {
    id: "KNW-POL-001",
    scope: "global",
    scopeRef: "*",
    constraint: "catalog-complete",
    allowed: ["KNW-001", "KNW-002", "KNW-003"],
    blocked: ["incomplete-knowledge-catalog"],
    requiredCheck: "KNW-CHK-001",
    exception: "KNW-EXC-001",
    enforcement: "gate",
    auditTrail: "KNW-AUD-001",
    required: true,
    description: "Knowledge catalog must be complete before retrieval evaluation",
  },
  {
    id: "KNW-POL-002",
    scope: "document",
    scopeRef: "KNW-001",
    constraint: "source-valid",
    allowed: ["v72-intelligence-freeze-1"],
    blocked: ["invalid-upstream-source"],
    requiredCheck: "KNW-CHK-002",
    exception: "KNW-EXC-002",
    enforcement: "gate",
    auditTrail: "KNW-AUD-002",
    required: true,
    description: "Intelligence baseline document must reference valid upstream source",
  },
  {
    id: "KNW-POL-003",
    scope: "document",
    scopeRef: "KNW-002",
    constraint: "dependency-acyclic",
    allowed: ["acyclic-knowledge-graph"],
    blocked: ["cyclic-knowledge-dependency"],
    requiredCheck: "KNW-CHK-003",
    exception: "KNW-EXC-003",
    enforcement: "declarative",
    auditTrail: "KNW-AUD-003",
    required: true,
    description: "Knowledge dependency graph must be acyclic",
  },
  {
    id: "KNW-POL-004",
    scope: "topic",
    scopeRef: "dependency-acyclic",
    constraint: "verify-pass",
    allowed: ["verify-exit-0"],
    blocked: ["verify-failure"],
    requiredCheck: "KNW-CHK-004",
    exception: "KNW-EXC-004",
    enforcement: "gate",
    auditTrail: "KNW-AUD-004",
    required: true,
    description: "Dependency acyclic topic requires verify pass",
  },
  {
    id: "KNW-POL-005",
    scope: "category",
    scopeRef: "governance",
    constraint: "confidence-threshold",
    allowed: ["high", "medium"],
    blocked: ["low-confidence-unapproved"],
    requiredCheck: "KNW-CHK-005",
    exception: "KNW-EXC-005",
    enforcement: "gate",
    auditTrail: "KNW-AUD-005",
    required: true,
    description: "Governance category requires confidence threshold",
  },
  {
    id: "KNW-POL-006",
    scope: "document",
    scopeRef: "KNW-004",
    constraint: "version-match",
    allowed: ["v72-intelligence-compatibility-1"],
    blocked: ["version-mismatch"],
    requiredCheck: "KNW-CHK-006",
    exception: "KNW-EXC-006",
    enforcement: "declarative",
    auditTrail: "KNW-AUD-006",
    required: true,
    description: "Compatibility matrix document must match declared version",
  },
  {
    id: "KNW-POL-007",
    scope: "document",
    scopeRef: "KNW-005",
    constraint: "access-gate",
    allowed: ["restricted-reviewed"],
    blocked: ["unauthorized-access"],
    requiredCheck: "KNW-CHK-007",
    exception: "KNW-EXC-007",
    enforcement: "audit-only",
    auditTrail: "KNW-AUD-007",
    required: true,
    description: "Governance risk document with restricted access requires review",
  },
  {
    id: "KNW-POL-008",
    scope: "category",
    scopeRef: "foundation",
    constraint: "tag-required",
    allowed: ["v73-catalog", "v72-freeze"],
    blocked: ["untagged-foundation"],
    requiredCheck: "KNW-CHK-008",
    exception: "KNW-EXC-008",
    enforcement: "audit-only",
    auditTrail: "KNW-AUD-008",
    required: true,
    description: "Foundation category knowledge requires retrieval tag",
  },
];

export const REQUIRED_CHECK_CATALOG: RequiredCheck[] = [
  {
    id: "KNW-CHK-001",
    policyRuleRef: "KNW-POL-001",
    checkKind: "manifest",
    passCondition: "catalogComplete === true",
    required: true,
    description: "Knowledge catalog completeness check",
  },
  {
    id: "KNW-CHK-002",
    policyRuleRef: "KNW-POL-002",
    checkKind: "source",
    passCondition: "source references v72-intelligence-freeze-1",
    required: true,
    description: "Upstream intelligence freeze source check",
  },
  {
    id: "KNW-CHK-003",
    policyRuleRef: "KNW-POL-003",
    checkKind: "graph",
    passCondition: "cycleCheck.acyclic === true",
    required: true,
    description: "Knowledge dependency acyclic check",
  },
  {
    id: "KNW-CHK-004",
    policyRuleRef: "KNW-POL-004",
    checkKind: "verify",
    passCondition: "verify exit code 0",
    required: true,
    description: "Dependency topic verify check",
  },
  {
    id: "KNW-CHK-005",
    policyRuleRef: "KNW-POL-005",
    checkKind: "confidence",
    passCondition: "confidence in allowed set",
    required: true,
    description: "Confidence threshold check",
  },
  {
    id: "KNW-CHK-006",
    policyRuleRef: "KNW-POL-006",
    checkKind: "version",
    passCondition: "version matches source",
    required: true,
    description: "Document version match check",
  },
  {
    id: "KNW-CHK-007",
    policyRuleRef: "KNW-POL-007",
    checkKind: "access",
    passCondition: "access reviewed or internal",
    required: true,
    description: "Access gate review check",
  },
  {
    id: "KNW-CHK-008",
    policyRuleRef: "KNW-POL-008",
    checkKind: "tag",
    passCondition: "tag in allowed set",
    required: true,
    description: "Foundation tag required check",
  },
];

export const POLICY_EXCEPTION_CATALOG: Exception[] = [
  {
    id: "KNW-EXC-001",
    policyRuleRef: "KNW-POL-001",
    exceptionKind: "catalog-waiver",
    status: "rejected",
    required: true,
    description: "Knowledge catalog incomplete waiver rejected",
  },
  {
    id: "KNW-EXC-002",
    policyRuleRef: "KNW-POL-002",
    exceptionKind: "source-bypass",
    status: "rejected",
    required: true,
    description: "Invalid source bypass rejected",
  },
  {
    id: "KNW-EXC-003",
    policyRuleRef: "KNW-POL-003",
    exceptionKind: "cycle-tolerance",
    status: "rejected",
    required: true,
    description: "Cyclic knowledge dependency tolerance rejected",
  },
  {
    id: "KNW-EXC-004",
    policyRuleRef: "KNW-POL-004",
    exceptionKind: "verify-waiver",
    status: "pending",
    required: true,
    description: "Verify waiver pending review",
  },
  {
    id: "KNW-EXC-005",
    policyRuleRef: "KNW-POL-005",
    exceptionKind: "confidence-waiver",
    status: "approved",
    required: true,
    description: "Confidence waiver template (none active)",
  },
  {
    id: "KNW-EXC-006",
    policyRuleRef: "KNW-POL-006",
    exceptionKind: "version-defer",
    status: "pending",
    required: true,
    description: "Version match deferral pending review",
  },
  {
    id: "KNW-EXC-007",
    policyRuleRef: "KNW-POL-007",
    exceptionKind: "access-skip",
    status: "rejected",
    required: true,
    description: "Access gate skip rejected",
  },
  {
    id: "KNW-EXC-008",
    policyRuleRef: "KNW-POL-008",
    exceptionKind: "tag-skip",
    status: "rejected",
    required: true,
    description: "Foundation tag skip rejected",
  },
];

export const AUDIT_TRAIL_CATALOG: AuditTrail[] = [
  {
    id: "KNW-AUD-001",
    policyRuleRef: "KNW-POL-001",
    event: "knowledge.catalog.check",
    retention: "365d",
    required: true,
    description: "Knowledge catalog policy audit trail",
  },
  {
    id: "KNW-AUD-002",
    policyRuleRef: "KNW-POL-002",
    event: "knowledge.source.verify",
    retention: "365d",
    required: true,
    description: "Upstream source policy audit trail",
  },
  {
    id: "KNW-AUD-003",
    policyRuleRef: "KNW-POL-003",
    event: "knowledge.dependency.cycle",
    retention: "180d",
    required: true,
    description: "Knowledge dependency cycle audit trail",
  },
  {
    id: "KNW-AUD-004",
    policyRuleRef: "KNW-POL-004",
    event: "knowledge.topic.verify",
    retention: "90d",
    required: true,
    description: "Topic verify audit trail",
  },
  {
    id: "KNW-AUD-005",
    policyRuleRef: "KNW-POL-005",
    event: "knowledge.confidence.gate",
    retention: "180d",
    required: true,
    description: "Confidence threshold audit trail",
  },
  {
    id: "KNW-AUD-006",
    policyRuleRef: "KNW-POL-006",
    event: "knowledge.version.check",
    retention: "180d",
    required: true,
    description: "Version match audit trail",
  },
  {
    id: "KNW-AUD-007",
    policyRuleRef: "KNW-POL-007",
    event: "knowledge.access.review",
    retention: "365d",
    required: true,
    description: "Access gate audit trail",
  },
  {
    id: "KNW-AUD-008",
    policyRuleRef: "KNW-POL-008",
    event: "knowledge.tag.gate",
    retention: "90d",
    required: true,
    description: "Foundation tag audit trail",
  },
];

export function isKnowledgePolicyRefsAligned(): boolean {
  const knowledgeIds = new Set(KNOWLEDGE_CATALOG.map((k) => k.id));
  const nodeIds = new Set(KNOWLEDGE_NODE_CATALOG.map((n) => n.id));
  const ruleIds = new Set(POLICY_RULE_CATALOG.map((r) => r.id));
  const checkIds = new Set(REQUIRED_CHECK_CATALOG.map((c) => c.id));
  const exceptionIds = new Set(POLICY_EXCEPTION_CATALOG.map((e) => e.id));
  const auditIds = new Set(AUDIT_TRAIL_CATALOG.map((a) => a.id));

  const rulesAligned = POLICY_RULE_CATALOG.every((rule) => {
    if (rule.scope === "document") return knowledgeIds.has(rule.scopeRef);
    return true;
  });

  const checksAligned = REQUIRED_CHECK_CATALOG.every((c) => ruleIds.has(c.policyRuleRef));
  const exceptionsAligned = POLICY_EXCEPTION_CATALOG.every((e) =>
    ruleIds.has(e.policyRuleRef),
  );
  const auditsAligned = AUDIT_TRAIL_CATALOG.every((a) => ruleIds.has(a.policyRuleRef));

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
    KNOWLEDGE_DEPENDENCY_CATALOG.length >= 6 &&
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
    version: V73_KNOWLEDGE_POLICY_VERSION,
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
    version: V73_KNOWLEDGE_POLICY_VERSION,
    entryCount: checks.length,
    catalogComplete,
    checks,
    summary: [
      `required-checks count=${checks.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPolicyExceptionManifest(): ExceptionManifest {
  const exceptions = POLICY_EXCEPTION_CATALOG;
  const statuses = new Set(exceptions.map((e) => e.status));
  const catalogComplete = exceptions.length >= 6 && statuses.size >= 3;

  return {
    version: V73_KNOWLEDGE_POLICY_VERSION,
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
    version: V73_KNOWLEDGE_POLICY_VERSION,
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

export function getExceptionByRuleRef(policyRuleRef: string): Exception | undefined {
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
