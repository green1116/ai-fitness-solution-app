/**
 * V71 P3 — Workflow policy rules (declarative)
 */
import { ORCHESTRATION_CATALOG } from "./orchestration.catalog";
import { WORKFLOW_DEPENDENCY_CATALOG, WORKFLOW_NODE_CATALOG } from "./dependency.graph";
import type {
  AuditTrail,
  AuditTrailManifest,
  PolicyException,
  PolicyExceptionManifest,
  PolicyRule,
  PolicyRuleManifest,
  RequiredCheck,
  RequiredCheckManifest,
} from "./workflow.policy";
import { V71_WORKFLOW_POLICY_VERSION } from "./workflow.policy";

export const POLICY_RULE_CATALOG: PolicyRule[] = [
  {
    id: "ORC-POL-001",
    scope: "global",
    scopeRef: "*",
    constraint: "catalog-complete",
    allowed: ["ORC-001", "ORC-002", "ORC-003"],
    blocked: ["incomplete-orchestration-catalog"],
    requiredCheck: "ORC-CHK-001",
    exception: "ORC-EXC-001",
    enforcement: "gate",
    auditTrail: "ORC-AUD-001",
    required: true,
    description: "Orchestration catalog must be complete before workflow execution",
  },
  {
    id: "ORC-POL-002",
    scope: "workflow",
    scopeRef: "ORC-001",
    constraint: "freeze-intact",
    allowed: ["v70-delivery-freeze-1"],
    blocked: ["unfrozen-delivery-baseline"],
    requiredCheck: "ORC-CHK-002",
    exception: "ORC-EXC-002",
    enforcement: "gate",
    auditTrail: "ORC-AUD-002",
    required: true,
    description: "Delivery lifecycle orchestration must reference frozen baseline",
  },
  {
    id: "ORC-POL-003",
    scope: "workflow",
    scopeRef: "ORC-002",
    constraint: "dependency-acyclic",
    allowed: ["acyclic-workflow-graph"],
    blocked: ["cyclic-workflow-dependency"],
    requiredCheck: "ORC-CHK-003",
    exception: "ORC-EXC-003",
    enforcement: "declarative",
    auditTrail: "ORC-AUD-003",
    required: true,
    description: "Workflow dependency graph must be acyclic",
  },
  {
    id: "ORC-POL-004",
    scope: "trigger",
    scopeRef: "gate-pass",
    constraint: "trigger-allowed",
    allowed: ["gate-pass", "approved-trigger"],
    blocked: ["unapproved-trigger"],
    requiredCheck: "ORC-CHK-004",
    exception: "ORC-EXC-004",
    enforcement: "gate",
    auditTrail: "ORC-AUD-004",
    required: true,
    description: "Gate-pass trigger requires upstream approval",
  },
  {
    id: "ORC-POL-005",
    scope: "action",
    scopeRef: "compliance-audit",
    constraint: "verify-pass",
    allowed: ["verify-exit-0"],
    blocked: ["verify-failure"],
    requiredCheck: "ORC-CHK-005",
    exception: "ORC-EXC-005",
    enforcement: "gate",
    auditTrail: "ORC-AUD-005",
    required: true,
    description: "Compliance audit action requires verify pass",
  },
  {
    id: "ORC-POL-006",
    scope: "workflow",
    scopeRef: "ORC-004",
    constraint: "timeout-defined",
    allowed: ["timeout-set"],
    blocked: ["missing-timeout"],
    requiredCheck: "ORC-CHK-006",
    exception: "ORC-EXC-006",
    enforcement: "declarative",
    auditTrail: "ORC-AUD-006",
    required: true,
    description: "Compatibility scan workflow must define timeout",
  },
  {
    id: "ORC-POL-007",
    scope: "workflow",
    scopeRef: "ORC-005",
    constraint: "retry-bounded",
    allowed: ["maxAttempts-defined"],
    blocked: ["unbounded-retry"],
    requiredCheck: "ORC-CHK-007",
    exception: "ORC-EXC-007",
    enforcement: "audit-only",
    auditTrail: "ORC-AUD-007",
    required: true,
    description: "Upgrade plan workflow must bound retry attempts",
  },
  {
    id: "ORC-POL-008",
    scope: "action",
    scopeRef: "signoff-freeze",
    constraint: "step-order-valid",
    allowed: ["ordered-steps"],
    blocked: ["out-of-order-steps"],
    requiredCheck: "ORC-CHK-008",
    exception: "ORC-EXC-008",
    enforcement: "audit-only",
    auditTrail: "ORC-AUD-008",
    required: true,
    description: "Sign-off freeze action requires valid step order",
  },
];

export const REQUIRED_CHECK_CATALOG: RequiredCheck[] = [
  {
    id: "ORC-CHK-001",
    policyRuleRef: "ORC-POL-001",
    checkKind: "manifest",
    passCondition: "catalogComplete === true",
    required: true,
    description: "Orchestration catalog completeness check",
  },
  {
    id: "ORC-CHK-002",
    policyRuleRef: "ORC-POL-002",
    checkKind: "freeze",
    passCondition: "input references v70-delivery-freeze-1",
    required: true,
    description: "Delivery freeze baseline check",
  },
  {
    id: "ORC-CHK-003",
    policyRuleRef: "ORC-POL-003",
    checkKind: "graph",
    passCondition: "cycleCheck.acyclic === true",
    required: true,
    description: "Workflow dependency acyclic check",
  },
  {
    id: "ORC-CHK-004",
    policyRuleRef: "ORC-POL-004",
    checkKind: "trigger",
    passCondition: "trigger in allowed set",
    required: true,
    description: "Gate-pass trigger approval check",
  },
  {
    id: "ORC-CHK-005",
    policyRuleRef: "ORC-POL-005",
    checkKind: "verify",
    passCondition: "verify exit code 0",
    required: true,
    description: "Compliance audit verify check",
  },
  {
    id: "ORC-CHK-006",
    policyRuleRef: "ORC-POL-006",
    checkKind: "timeout",
    passCondition: "timeout.length > 0",
    required: true,
    description: "Workflow timeout defined check",
  },
  {
    id: "ORC-CHK-007",
    policyRuleRef: "ORC-POL-007",
    checkKind: "retry",
    passCondition: "retry.maxAttempts >= 0",
    required: true,
    description: "Retry bounded check",
  },
  {
    id: "ORC-CHK-008",
    policyRuleRef: "ORC-POL-008",
    checkKind: "order",
    passCondition: "step order valid in dependency graph",
    required: true,
    description: "Step order validity check",
  },
];

export const POLICY_EXCEPTION_CATALOG: PolicyException[] = [
  {
    id: "ORC-EXC-001",
    policyRuleRef: "ORC-POL-001",
    exceptionKind: "catalog-waiver",
    status: "rejected",
    required: true,
    description: "Orchestration catalog incomplete waiver rejected",
  },
  {
    id: "ORC-EXC-002",
    policyRuleRef: "ORC-POL-002",
    exceptionKind: "freeze-bypass",
    status: "rejected",
    required: true,
    description: "Delivery freeze bypass rejected",
  },
  {
    id: "ORC-EXC-003",
    policyRuleRef: "ORC-POL-003",
    exceptionKind: "cycle-tolerance",
    status: "rejected",
    required: true,
    description: "Cyclic workflow dependency tolerance rejected",
  },
  {
    id: "ORC-EXC-004",
    policyRuleRef: "ORC-POL-004",
    exceptionKind: "trigger-skip",
    status: "pending",
    required: true,
    description: "Gate-pass trigger skip pending review",
  },
  {
    id: "ORC-EXC-005",
    policyRuleRef: "ORC-POL-005",
    exceptionKind: "verify-waiver",
    status: "approved",
    required: true,
    description: "Verify waiver template (none active)",
  },
  {
    id: "ORC-EXC-006",
    policyRuleRef: "ORC-POL-006",
    exceptionKind: "timeout-defer",
    status: "pending",
    required: true,
    description: "Timeout deferral pending review",
  },
  {
    id: "ORC-EXC-007",
    policyRuleRef: "ORC-POL-007",
    exceptionKind: "retry-unbound",
    status: "rejected",
    required: true,
    description: "Unbounded retry exception rejected",
  },
  {
    id: "ORC-EXC-008",
    policyRuleRef: "ORC-POL-008",
    exceptionKind: "order-skip",
    status: "rejected",
    required: true,
    description: "Step order skip rejected",
  },
];

export const AUDIT_TRAIL_CATALOG: AuditTrail[] = [
  {
    id: "ORC-AUD-001",
    policyRuleRef: "ORC-POL-001",
    event: "workflow.catalog.check",
    retention: "365d",
    required: true,
    description: "Orchestration catalog policy audit trail",
  },
  {
    id: "ORC-AUD-002",
    policyRuleRef: "ORC-POL-002",
    event: "workflow.freeze.verify",
    retention: "365d",
    required: true,
    description: "Delivery freeze policy audit trail",
  },
  {
    id: "ORC-AUD-003",
    policyRuleRef: "ORC-POL-003",
    event: "workflow.dependency.cycle",
    retention: "180d",
    required: true,
    description: "Workflow dependency cycle audit trail",
  },
  {
    id: "ORC-AUD-004",
    policyRuleRef: "ORC-POL-004",
    event: "workflow.trigger.gate-pass",
    retention: "730d",
    required: true,
    description: "Gate-pass trigger audit trail",
  },
  {
    id: "ORC-AUD-005",
    policyRuleRef: "ORC-POL-005",
    event: "workflow.action.verify",
    retention: "90d",
    required: true,
    description: "Compliance audit verify audit trail",
  },
  {
    id: "ORC-AUD-006",
    policyRuleRef: "ORC-POL-006",
    event: "workflow.timeout.check",
    retention: "180d",
    required: true,
    description: "Timeout policy audit trail",
  },
  {
    id: "ORC-AUD-007",
    policyRuleRef: "ORC-POL-007",
    event: "workflow.retry.bound",
    retention: "365d",
    required: true,
    description: "Retry bounded audit trail",
  },
  {
    id: "ORC-AUD-008",
    policyRuleRef: "ORC-POL-008",
    event: "workflow.step.order",
    retention: "90d",
    required: true,
    description: "Step order audit trail",
  },
];

export function isWorkflowPolicyRefsAligned(): boolean {
  const orchestrationIds = new Set(ORCHESTRATION_CATALOG.map((o) => o.id));
  const nodeIds = new Set(WORKFLOW_NODE_CATALOG.map((n) => n.id));
  const ruleIds = new Set(POLICY_RULE_CATALOG.map((r) => r.id));
  const checkIds = new Set(REQUIRED_CHECK_CATALOG.map((c) => c.id));
  const exceptionIds = new Set(POLICY_EXCEPTION_CATALOG.map((e) => e.id));
  const auditIds = new Set(AUDIT_TRAIL_CATALOG.map((a) => a.id));

  const rulesAligned = POLICY_RULE_CATALOG.every((rule) => {
    if (rule.scope === "workflow") return orchestrationIds.has(rule.scopeRef);
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
    WORKFLOW_DEPENDENCY_CATALOG.length >= 6 &&
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
    version: V71_WORKFLOW_POLICY_VERSION,
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
    version: V71_WORKFLOW_POLICY_VERSION,
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
    version: V71_WORKFLOW_POLICY_VERSION,
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
    version: V71_WORKFLOW_POLICY_VERSION,
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
