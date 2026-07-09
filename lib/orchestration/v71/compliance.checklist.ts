/**
 * V71 P7 — Workflow compliance checklist (declarative)
 */
import { GOVERNANCE_RULE_CATALOG } from "./governance.rules";
import { LIFECYCLE_STATE_CATALOG } from "./lifecycle.states";
import { ORCHESTRATION_CATALOG } from "./orchestration.catalog";
import type {
  ComplianceAuditTrail,
  ComplianceAuditTrailManifest,
  ComplianceChecklistManifest,
  ComplianceException,
  ComplianceExceptionManifest,
  ComplianceItem,
  ComplianceSignoff,
  ComplianceSignoffManifest,
  FreezeGate,
  FreezeGateManifest,
} from "./workflow.compliance";
import { V71_WORKFLOW_COMPLIANCE_VERSION } from "./workflow.compliance";

export const COMPLIANCE_ITEM_CATALOG: ComplianceItem[] = [
  {
    id: "ORC-CMP-001",
    orchestrationRef: "ORC-001",
    lifecycleStateRef: "ORC-LCS-001",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v70-delivery-freeze-1 PASS",
    review: "approved",
    exception: "ORC-CMP-EXC-001",
    auditTrail: "ORC-CMP-AUD-001",
    freezeGate: "ORC-CMP-GATE-001",
    signoff: "ORC-CMP-SIGN-001",
    description: "Delivery lifecycle orchestration compliance",
  },
  {
    id: "ORC-CMP-002",
    orchestrationRef: "ORC-002",
    lifecycleStateRef: "ORC-LCS-002",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v71-p2-workflow-dependency PASS",
    review: "approved",
    exception: "ORC-CMP-EXC-002",
    auditTrail: "ORC-CMP-AUD-002",
    freezeGate: "ORC-CMP-GATE-002",
    signoff: "ORC-CMP-SIGN-002",
    description: "Dependency resolution orchestration compliance",
  },
  {
    id: "ORC-CMP-003",
    orchestrationRef: "ORC-003",
    lifecycleStateRef: "ORC-LCS-003",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v71-p3-workflow-policy PASS",
    review: "approved",
    exception: "ORC-CMP-EXC-003",
    auditTrail: "ORC-CMP-AUD-003",
    freezeGate: "ORC-CMP-GATE-003",
    signoff: "ORC-CMP-SIGN-003",
    description: "Policy gate orchestration compliance",
  },
  {
    id: "ORC-CMP-004",
    orchestrationRef: "ORC-004",
    lifecycleStateRef: "ORC-LCS-004",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v71-p4-workflow-compatibility PASS",
    review: "approved",
    exception: "ORC-CMP-EXC-004",
    auditTrail: "ORC-CMP-AUD-004",
    freezeGate: "ORC-CMP-GATE-004",
    signoff: "ORC-CMP-SIGN-004",
    description: "Compatibility scan orchestration compliance",
  },
  {
    id: "ORC-CMP-005",
    orchestrationRef: "ORC-005",
    lifecycleStateRef: "ORC-LCS-005",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v71-p5-workflow-governance PASS",
    review: "approved",
    exception: "ORC-CMP-EXC-005",
    auditTrail: "ORC-CMP-AUD-005",
    freezeGate: "ORC-CMP-GATE-005",
    signoff: "ORC-CMP-SIGN-005",
    description: "Upgrade plan orchestration compliance",
  },
  {
    id: "ORC-CMP-006",
    orchestrationRef: "ORC-006",
    lifecycleStateRef: "ORC-LCS-006",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v71-p6-workflow-lifecycle PASS",
    review: "pending",
    exception: "ORC-CMP-EXC-006",
    auditTrail: "ORC-CMP-AUD-006",
    freezeGate: "ORC-CMP-GATE-006",
    signoff: "ORC-CMP-SIGN-006",
    description: "Lifecycle transition orchestration compliance",
  },
  {
    id: "ORC-CMP-007",
    orchestrationRef: "ORC-007",
    lifecycleStateRef: "ORC-LCS-007",
    required: false,
    passed: true,
    failed: false,
    evidence: "compliance audit webhook pass",
    review: "waived",
    exception: "ORC-CMP-EXC-007",
    auditTrail: "ORC-CMP-AUD-007",
    freezeGate: "ORC-CMP-GATE-007",
    signoff: "ORC-CMP-SIGN-007",
    description: "Compliance audit orchestration compliance",
  },
  {
    id: "ORC-CMP-008",
    orchestrationRef: "ORC-008",
    lifecycleStateRef: "ORC-LCS-008",
    required: true,
    passed: true,
    failed: false,
    evidence: "archived — no active orchestration",
    review: "approved",
    exception: "ORC-CMP-EXC-008",
    auditTrail: "ORC-CMP-AUD-008",
    freezeGate: "ORC-CMP-GATE-008",
    signoff: "ORC-CMP-SIGN-008",
    description: "Sign-off freeze orchestration archived compliance",
  },
];

export const COMPLIANCE_EXCEPTION_CATALOG: ComplianceException[] = [
  {
    id: "ORC-CMP-EXC-001",
    complianceItemRef: "ORC-CMP-001",
    exceptionKind: "orchestration-waiver",
    status: "rejected",
    required: true,
    description: "Delivery lifecycle waiver rejected",
  },
  {
    id: "ORC-CMP-EXC-002",
    complianceItemRef: "ORC-CMP-002",
    exceptionKind: "dependency-waiver",
    status: "rejected",
    required: true,
    description: "Dependency resolution waiver rejected",
  },
  {
    id: "ORC-CMP-EXC-003",
    complianceItemRef: "ORC-CMP-003",
    exceptionKind: "policy-waiver",
    status: "rejected",
    required: true,
    description: "Policy gate waiver rejected",
  },
  {
    id: "ORC-CMP-EXC-004",
    complianceItemRef: "ORC-CMP-004",
    exceptionKind: "compatibility-waiver",
    status: "pending",
    required: true,
    description: "Compatibility scan waiver pending",
  },
  {
    id: "ORC-CMP-EXC-005",
    complianceItemRef: "ORC-CMP-005",
    exceptionKind: "governance-waiver",
    status: "rejected",
    required: true,
    description: "Governance waiver rejected",
  },
  {
    id: "ORC-CMP-EXC-006",
    complianceItemRef: "ORC-CMP-006",
    exceptionKind: "lifecycle-waiver",
    status: "pending",
    required: true,
    description: "Lifecycle transition waiver pending",
  },
  {
    id: "ORC-CMP-EXC-007",
    complianceItemRef: "ORC-CMP-007",
    exceptionKind: "audit-waiver",
    status: "approved",
    required: true,
    description: "Compliance audit waiver approved template",
  },
  {
    id: "ORC-CMP-EXC-008",
    complianceItemRef: "ORC-CMP-008",
    exceptionKind: "archive-waiver",
    status: "rejected",
    required: true,
    description: "Archive waiver rejected",
  },
];

export const COMPLIANCE_AUDIT_TRAIL_CATALOG: ComplianceAuditTrail[] = [
  {
    id: "ORC-CMP-AUD-001",
    complianceItemRef: "ORC-CMP-001",
    event: "workflow.compliance.catalog",
    retention: "365d",
    required: true,
    description: "Delivery lifecycle compliance audit trail",
  },
  {
    id: "ORC-CMP-AUD-002",
    complianceItemRef: "ORC-CMP-002",
    event: "workflow.compliance.dependency",
    retention: "180d",
    required: true,
    description: "Dependency compliance audit trail",
  },
  {
    id: "ORC-CMP-AUD-003",
    complianceItemRef: "ORC-CMP-003",
    event: "workflow.compliance.policy",
    retention: "180d",
    required: true,
    description: "Policy gate compliance audit trail",
  },
  {
    id: "ORC-CMP-AUD-004",
    complianceItemRef: "ORC-CMP-004",
    event: "workflow.compliance.compatibility",
    retention: "180d",
    required: true,
    description: "Compatibility compliance audit trail",
  },
  {
    id: "ORC-CMP-AUD-005",
    complianceItemRef: "ORC-CMP-005",
    event: "workflow.compliance.governance",
    retention: "365d",
    required: true,
    description: "Governance compliance audit trail",
  },
  {
    id: "ORC-CMP-AUD-006",
    complianceItemRef: "ORC-CMP-006",
    event: "workflow.compliance.lifecycle",
    retention: "90d",
    required: true,
    description: "Lifecycle compliance audit trail",
  },
  {
    id: "ORC-CMP-AUD-007",
    complianceItemRef: "ORC-CMP-007",
    event: "workflow.compliance.audit",
    retention: "30d",
    required: true,
    description: "Compliance audit trail",
  },
  {
    id: "ORC-CMP-AUD-008",
    complianceItemRef: "ORC-CMP-008",
    event: "workflow.compliance.archive",
    retention: "730d",
    required: true,
    description: "Archive compliance audit trail",
  },
];

export const COMPLIANCE_FREEZE_GATE_CATALOG: FreezeGate[] = [
  {
    id: "ORC-CMP-GATE-001",
    complianceItemRef: "ORC-CMP-001",
    gateKind: "orchestration-catalog",
    verifyScript: "npx tsx scripts/verify-v71-p1-orchestration-catalog.ts",
    required: true,
    description: "Orchestration catalog freeze gate",
  },
  {
    id: "ORC-CMP-GATE-002",
    complianceItemRef: "ORC-CMP-002",
    gateKind: "workflow-dependency",
    verifyScript: "npx tsx scripts/verify-v71-p2-workflow-dependency.ts",
    required: true,
    description: "Workflow dependency freeze gate",
  },
  {
    id: "ORC-CMP-GATE-003",
    complianceItemRef: "ORC-CMP-003",
    gateKind: "workflow-policy",
    verifyScript: "npx tsx scripts/verify-v71-p3-workflow-policy.ts",
    required: true,
    description: "Workflow policy freeze gate",
  },
  {
    id: "ORC-CMP-GATE-004",
    complianceItemRef: "ORC-CMP-004",
    gateKind: "workflow-compatibility",
    verifyScript: "npx tsx scripts/verify-v71-p4-workflow-compatibility.ts",
    required: true,
    description: "Workflow compatibility freeze gate",
  },
  {
    id: "ORC-CMP-GATE-005",
    complianceItemRef: "ORC-CMP-005",
    gateKind: "workflow-governance",
    verifyScript: "npx tsx scripts/verify-v71-p5-workflow-governance.ts",
    required: true,
    description: "Workflow governance freeze gate",
  },
  {
    id: "ORC-CMP-GATE-006",
    complianceItemRef: "ORC-CMP-006",
    gateKind: "workflow-lifecycle",
    verifyScript: "npx tsx scripts/verify-v71-p6-workflow-lifecycle.ts",
    required: true,
    description: "Workflow lifecycle freeze gate",
  },
  {
    id: "ORC-CMP-GATE-007",
    complianceItemRef: "ORC-CMP-007",
    gateKind: "compliance-audit",
    verifyScript: "declarative:compliance-audit-pass",
    required: false,
    description: "Compliance audit freeze gate",
  },
  {
    id: "ORC-CMP-GATE-008",
    complianceItemRef: "ORC-CMP-008",
    gateKind: "archive-terminal",
    verifyScript: "declarative:archive-terminal",
    required: true,
    description: "Archive terminal freeze gate",
  },
];

export const COMPLIANCE_SIGNOFF_CATALOG: ComplianceSignoff[] = [
  {
    id: "ORC-CMP-SIGN-001",
    complianceItemRef: "ORC-CMP-001",
    signoffRole: "release-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Delivery lifecycle compliance signoff",
  },
  {
    id: "ORC-CMP-SIGN-002",
    complianceItemRef: "ORC-CMP-002",
    signoffRole: "release-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Dependency compliance signoff",
  },
  {
    id: "ORC-CMP-SIGN-003",
    complianceItemRef: "ORC-CMP-003",
    signoffRole: "governance",
    signoffStatus: "signed",
    required: true,
    description: "Policy gate compliance signoff",
  },
  {
    id: "ORC-CMP-SIGN-004",
    complianceItemRef: "ORC-CMP-004",
    signoffRole: "platform-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Compatibility compliance signoff",
  },
  {
    id: "ORC-CMP-SIGN-005",
    complianceItemRef: "ORC-CMP-005",
    signoffRole: "release-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Governance compliance signoff",
  },
  {
    id: "ORC-CMP-SIGN-006",
    complianceItemRef: "ORC-CMP-006",
    signoffRole: "product-engineering",
    signoffStatus: "required",
    required: true,
    description: "Lifecycle compliance signoff pending",
  },
  {
    id: "ORC-CMP-SIGN-007",
    complianceItemRef: "ORC-CMP-007",
    signoffRole: "governance",
    signoffStatus: "signed",
    required: false,
    description: "Compliance audit signoff",
  },
  {
    id: "ORC-CMP-SIGN-008",
    complianceItemRef: "ORC-CMP-008",
    signoffRole: "release-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Archive compliance signoff",
  },
];

function isExclusivePassFail(item: ComplianceItem): boolean {
  return item.passed !== item.failed;
}

function requiredItemsPassed(): boolean {
  return COMPLIANCE_ITEM_CATALOG.filter((i) => i.required).every(
    (i) => i.passed && !i.failed,
  );
}

export function isWorkflowComplianceRefsAligned(): boolean {
  const orchestrationIds = new Set(ORCHESTRATION_CATALOG.map((o) => o.id));
  const lifecycleIds = new Set(LIFECYCLE_STATE_CATALOG.map((s) => s.id));
  const itemIds = new Set(COMPLIANCE_ITEM_CATALOG.map((i) => i.id));
  const exceptionIds = new Set(COMPLIANCE_EXCEPTION_CATALOG.map((e) => e.id));
  const auditIds = new Set(COMPLIANCE_AUDIT_TRAIL_CATALOG.map((a) => a.id));
  const gateIds = new Set(COMPLIANCE_FREEZE_GATE_CATALOG.map((g) => g.id));
  const signoffIds = new Set(COMPLIANCE_SIGNOFF_CATALOG.map((s) => s.id));
  const governanceRuleCount = GOVERNANCE_RULE_CATALOG.length;

  const itemsAligned = COMPLIANCE_ITEM_CATALOG.every(
    (i) =>
      orchestrationIds.has(i.orchestrationRef) &&
      lifecycleIds.has(i.lifecycleStateRef) &&
      exceptionIds.has(i.exception) &&
      auditIds.has(i.auditTrail) &&
      gateIds.has(i.freezeGate) &&
      signoffIds.has(i.signoff) &&
      isExclusivePassFail(i),
  );

  const subAligned =
    COMPLIANCE_EXCEPTION_CATALOG.every((e) => itemIds.has(e.complianceItemRef)) &&
    COMPLIANCE_AUDIT_TRAIL_CATALOG.every((a) => itemIds.has(a.complianceItemRef)) &&
    COMPLIANCE_FREEZE_GATE_CATALOG.every((g) => itemIds.has(g.complianceItemRef)) &&
    COMPLIANCE_SIGNOFF_CATALOG.every((s) => itemIds.has(s.complianceItemRef));

  const coverageComplete =
    COMPLIANCE_ITEM_CATALOG.length >= 6 &&
    governanceRuleCount >= 6 &&
    requiredItemsPassed();

  return itemsAligned && subAligned && coverageComplete;
}

export function buildComplianceChecklistManifest(): ComplianceChecklistManifest {
  const items = COMPLIANCE_ITEM_CATALOG;
  const passedCount = items.filter((i) => i.passed).length;
  const failedCount = items.filter((i) => i.failed).length;
  const checklistComplete =
    items.length >= 6 && requiredItemsPassed() && items.every(isExclusivePassFail);

  return {
    version: V71_WORKFLOW_COMPLIANCE_VERSION,
    itemCount: items.length,
    passedCount,
    failedCount,
    checklistComplete,
    items,
    summary: [
      `workflow-compliance-checklist count=${items.length}`,
      `passed=${passedCount}`,
      `failed=${failedCount}`,
      `complete=${checklistComplete}`,
    ].join(" "),
  };
}

export function buildComplianceExceptionManifest(): ComplianceExceptionManifest {
  const exceptions = COMPLIANCE_EXCEPTION_CATALOG;
  const catalogComplete = exceptions.length >= 6;

  return {
    version: V71_WORKFLOW_COMPLIANCE_VERSION,
    entryCount: exceptions.length,
    catalogComplete,
    exceptions,
    summary: [
      `workflow-compliance-exceptions count=${exceptions.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildComplianceAuditTrailManifest(): ComplianceAuditTrailManifest {
  const trails = COMPLIANCE_AUDIT_TRAIL_CATALOG;
  const catalogComplete = trails.length >= 6;

  return {
    version: V71_WORKFLOW_COMPLIANCE_VERSION,
    entryCount: trails.length,
    catalogComplete,
    trails,
    summary: [
      `workflow-compliance-audit-trails count=${trails.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildFreezeGateManifest(): FreezeGateManifest {
  const gates = COMPLIANCE_FREEZE_GATE_CATALOG;
  const catalogComplete = gates.length >= 6;

  return {
    version: V71_WORKFLOW_COMPLIANCE_VERSION,
    gateCount: gates.length,
    catalogComplete,
    gates,
    summary: [
      `workflow-freeze-gates count=${gates.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildComplianceSignoffManifest(): ComplianceSignoffManifest {
  const signoffs = COMPLIANCE_SIGNOFF_CATALOG;
  const catalogComplete = signoffs.length >= 6;

  return {
    version: V71_WORKFLOW_COMPLIANCE_VERSION,
    entryCount: signoffs.length,
    catalogComplete,
    signoffs,
    summary: [
      `workflow-compliance-signoffs count=${signoffs.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getComplianceItemById(id: string): ComplianceItem | undefined {
  return COMPLIANCE_ITEM_CATALOG.find((i) => i.id === id);
}

export function getComplianceItemsByOrchestrationRef(
  orchestrationRef: string,
): ComplianceItem[] {
  return COMPLIANCE_ITEM_CATALOG.filter((i) => i.orchestrationRef === orchestrationRef);
}

export function getFreezeGateByItemRef(
  complianceItemRef: string,
): FreezeGate | undefined {
  return COMPLIANCE_FREEZE_GATE_CATALOG.find((g) => g.complianceItemRef === complianceItemRef);
}

export function getSignoffByItemRef(
  complianceItemRef: string,
): ComplianceSignoff | undefined {
  return COMPLIANCE_SIGNOFF_CATALOG.find((s) => s.complianceItemRef === complianceItemRef);
}

export function computeDeclarativeCompliancePass(input: {
  required: boolean;
  passed: boolean;
  failed: boolean;
}): boolean {
  if (!input.required) return true;
  return input.passed && !input.failed;
}
