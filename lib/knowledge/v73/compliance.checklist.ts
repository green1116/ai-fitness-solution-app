/**
 * V73 P7 — Knowledge compliance checklist (declarative)
 */
import { GOVERNANCE_RULE_CATALOG } from "./governance.rules";
import { KNOWLEDGE_CATALOG } from "./knowledge.catalog";
import { LIFECYCLE_STATE_CATALOG } from "./lifecycle.states";
import type {
  AuditTrail,
  AuditTrailManifest,
  ComplianceChecklistManifest,
  ComplianceItem,
  Exception,
  ExceptionManifest,
  Failed,
  FreezeGate,
  FreezeGateManifest,
  Passed,
  Required,
  Signoff,
  SignoffManifest,
} from "./knowledge.compliance";
import { V73_KNOWLEDGE_COMPLIANCE_VERSION } from "./knowledge.compliance";

export const COMPLIANCE_ITEM_CATALOG: ComplianceItem[] = [
  {
    id: "KNW-CMP-001",
    knowledgeRef: "KNW-001",
    lifecycleStateRef: "KNW-LCS-001",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v72-intelligence-freeze-1 PASS",
    review: "approved",
    exception: "KNW-CMP-EXC-001",
    auditTrail: "KNW-CMP-AUD-001",
    freezeGate: "KNW-CMP-GATE-001",
    signoff: "KNW-CMP-SIGN-001",
    description: "Operational intelligence baseline knowledge compliance",
  },
  {
    id: "KNW-CMP-002",
    knowledgeRef: "KNW-002",
    lifecycleStateRef: "KNW-LCS-002",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v73-p2-knowledge-dependency PASS",
    review: "approved",
    exception: "KNW-CMP-EXC-002",
    auditTrail: "KNW-CMP-AUD-002",
    freezeGate: "KNW-CMP-GATE-002",
    signoff: "KNW-CMP-SIGN-002",
    description: "Signal dependency graph knowledge compliance",
  },
  {
    id: "KNW-CMP-003",
    knowledgeRef: "KNW-003",
    lifecycleStateRef: "KNW-LCS-003",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v73-p3-knowledge-policy PASS",
    review: "approved",
    exception: "KNW-CMP-EXC-003",
    auditTrail: "KNW-CMP-AUD-003",
    freezeGate: "KNW-CMP-GATE-003",
    signoff: "KNW-CMP-SIGN-003",
    description: "Intelligence policy gate knowledge compliance",
  },
  {
    id: "KNW-CMP-004",
    knowledgeRef: "KNW-004",
    lifecycleStateRef: "KNW-LCS-004",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v73-p4-knowledge-compatibility PASS",
    review: "approved",
    exception: "KNW-CMP-EXC-004",
    auditTrail: "KNW-CMP-AUD-004",
    freezeGate: "KNW-CMP-GATE-004",
    signoff: "KNW-CMP-SIGN-004",
    description: "Compatibility matrix guide knowledge compliance",
  },
  {
    id: "KNW-CMP-005",
    knowledgeRef: "KNW-005",
    lifecycleStateRef: "KNW-LCS-005",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v73-p5-knowledge-governance PASS",
    review: "approved",
    exception: "KNW-CMP-EXC-005",
    auditTrail: "KNW-CMP-AUD-005",
    freezeGate: "KNW-CMP-GATE-005",
    signoff: "KNW-CMP-SIGN-005",
    description: "Governance risk escalation knowledge compliance",
  },
  {
    id: "KNW-CMP-006",
    knowledgeRef: "KNW-006",
    lifecycleStateRef: "KNW-LCS-006",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v73-p6-knowledge-lifecycle PASS",
    review: "pending",
    exception: "KNW-CMP-EXC-006",
    auditTrail: "KNW-CMP-AUD-006",
    freezeGate: "KNW-CMP-GATE-006",
    signoff: "KNW-CMP-SIGN-006",
    description: "Lifecycle state reference knowledge compliance",
  },
  {
    id: "KNW-CMP-007",
    knowledgeRef: "KNW-007",
    lifecycleStateRef: "KNW-LCS-007",
    required: false,
    passed: true,
    failed: false,
    evidence: "compliance audit webhook pass",
    review: "waived",
    exception: "KNW-CMP-EXC-007",
    auditTrail: "KNW-CMP-AUD-007",
    freezeGate: "KNW-CMP-GATE-007",
    signoff: "KNW-CMP-SIGN-007",
    description: "Compliance checklist reference knowledge compliance",
  },
  {
    id: "KNW-CMP-008",
    knowledgeRef: "KNW-008",
    lifecycleStateRef: "KNW-LCS-008",
    required: true,
    passed: true,
    failed: false,
    evidence: "archived — no active knowledge",
    review: "approved",
    exception: "KNW-CMP-EXC-008",
    auditTrail: "KNW-CMP-AUD-008",
    freezeGate: "KNW-CMP-GATE-008",
    signoff: "KNW-CMP-SIGN-008",
    description: "Knowledge foundation catalog archived compliance",
  },
];

export const COMPLIANCE_EXCEPTION_CATALOG: Exception[] = [
  {
    id: "KNW-CMP-EXC-001",
    complianceItemRef: "KNW-CMP-001",
    exceptionKind: "document-waiver",
    status: "rejected",
    required: true,
    description: "Operational baseline waiver rejected",
  },
  {
    id: "KNW-CMP-EXC-002",
    complianceItemRef: "KNW-CMP-002",
    exceptionKind: "dependency-waiver",
    status: "rejected",
    required: true,
    description: "Signal dependency waiver rejected",
  },
  {
    id: "KNW-CMP-EXC-003",
    complianceItemRef: "KNW-CMP-003",
    exceptionKind: "policy-waiver",
    status: "rejected",
    required: true,
    description: "Policy gate waiver rejected",
  },
  {
    id: "KNW-CMP-EXC-004",
    complianceItemRef: "KNW-CMP-004",
    exceptionKind: "compatibility-waiver",
    status: "pending",
    required: true,
    description: "Compatibility matrix waiver pending",
  },
  {
    id: "KNW-CMP-EXC-005",
    complianceItemRef: "KNW-CMP-005",
    exceptionKind: "governance-waiver",
    status: "rejected",
    required: true,
    description: "Governance waiver rejected",
  },
  {
    id: "KNW-CMP-EXC-006",
    complianceItemRef: "KNW-CMP-006",
    exceptionKind: "lifecycle-waiver",
    status: "pending",
    required: true,
    description: "Lifecycle transition waiver pending",
  },
  {
    id: "KNW-CMP-EXC-007",
    complianceItemRef: "KNW-CMP-007",
    exceptionKind: "audit-waiver",
    status: "approved",
    required: true,
    description: "Compliance audit waiver approved template",
  },
  {
    id: "KNW-CMP-EXC-008",
    complianceItemRef: "KNW-CMP-008",
    exceptionKind: "archive-waiver",
    status: "rejected",
    required: true,
    description: "Archive waiver rejected",
  },
];

export const COMPLIANCE_AUDIT_TRAIL_CATALOG: AuditTrail[] = [
  {
    id: "KNW-CMP-AUD-001",
    complianceItemRef: "KNW-CMP-001",
    event: "knowledge.compliance.catalog",
    retention: "365d",
    required: true,
    description: "Operational baseline compliance audit trail",
  },
  {
    id: "KNW-CMP-AUD-002",
    complianceItemRef: "KNW-CMP-002",
    event: "knowledge.compliance.dependency",
    retention: "180d",
    required: true,
    description: "Dependency compliance audit trail",
  },
  {
    id: "KNW-CMP-AUD-003",
    complianceItemRef: "KNW-CMP-003",
    event: "knowledge.compliance.policy",
    retention: "180d",
    required: true,
    description: "Policy gate compliance audit trail",
  },
  {
    id: "KNW-CMP-AUD-004",
    complianceItemRef: "KNW-CMP-004",
    event: "knowledge.compliance.compatibility",
    retention: "180d",
    required: true,
    description: "Compatibility compliance audit trail",
  },
  {
    id: "KNW-CMP-AUD-005",
    complianceItemRef: "KNW-CMP-005",
    event: "knowledge.compliance.governance",
    retention: "365d",
    required: true,
    description: "Governance compliance audit trail",
  },
  {
    id: "KNW-CMP-AUD-006",
    complianceItemRef: "KNW-CMP-006",
    event: "knowledge.compliance.lifecycle",
    retention: "90d",
    required: true,
    description: "Lifecycle compliance audit trail",
  },
  {
    id: "KNW-CMP-AUD-007",
    complianceItemRef: "KNW-CMP-007",
    event: "knowledge.compliance.audit",
    retention: "30d",
    required: true,
    description: "Compliance audit trail",
  },
  {
    id: "KNW-CMP-AUD-008",
    complianceItemRef: "KNW-CMP-008",
    event: "knowledge.compliance.archive",
    retention: "730d",
    required: true,
    description: "Archive compliance audit trail",
  },
];

export const COMPLIANCE_FREEZE_GATE_CATALOG: FreezeGate[] = [
  {
    id: "KNW-CMP-GATE-001",
    complianceItemRef: "KNW-CMP-001",
    gateKind: "knowledge-catalog",
    verifyScript: "npx tsx scripts/verify-v73-p1-knowledge-catalog.ts",
    required: true,
    description: "Knowledge catalog freeze gate",
  },
  {
    id: "KNW-CMP-GATE-002",
    complianceItemRef: "KNW-CMP-002",
    gateKind: "knowledge-dependency",
    verifyScript: "npx tsx scripts/verify-v73-p2-knowledge-dependency.ts",
    required: true,
    description: "Knowledge dependency freeze gate",
  },
  {
    id: "KNW-CMP-GATE-003",
    complianceItemRef: "KNW-CMP-003",
    gateKind: "knowledge-policy",
    verifyScript: "npx tsx scripts/verify-v73-p3-knowledge-policy.ts",
    required: true,
    description: "Knowledge policy freeze gate",
  },
  {
    id: "KNW-CMP-GATE-004",
    complianceItemRef: "KNW-CMP-004",
    gateKind: "knowledge-compatibility",
    verifyScript: "npx tsx scripts/verify-v73-p4-knowledge-compatibility.ts",
    required: true,
    description: "Knowledge compatibility freeze gate",
  },
  {
    id: "KNW-CMP-GATE-005",
    complianceItemRef: "KNW-CMP-005",
    gateKind: "knowledge-governance",
    verifyScript: "npx tsx scripts/verify-v73-p5-knowledge-governance.ts",
    required: true,
    description: "Knowledge governance freeze gate",
  },
  {
    id: "KNW-CMP-GATE-006",
    complianceItemRef: "KNW-CMP-006",
    gateKind: "knowledge-lifecycle",
    verifyScript: "npx tsx scripts/verify-v73-p6-knowledge-lifecycle.ts",
    required: true,
    description: "Knowledge lifecycle freeze gate",
  },
  {
    id: "KNW-CMP-GATE-007",
    complianceItemRef: "KNW-CMP-007",
    gateKind: "compliance-audit",
    verifyScript: "declarative:compliance-audit-pass",
    required: false,
    description: "Compliance audit freeze gate",
  },
  {
    id: "KNW-CMP-GATE-008",
    complianceItemRef: "KNW-CMP-008",
    gateKind: "archive-terminal",
    verifyScript: "declarative:archive-terminal",
    required: true,
    description: "Archive terminal freeze gate",
  },
];

export const COMPLIANCE_SIGNOFF_CATALOG: Signoff[] = [
  {
    id: "KNW-CMP-SIGN-001",
    complianceItemRef: "KNW-CMP-001",
    signoffRole: "platform-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Operational baseline compliance signoff",
  },
  {
    id: "KNW-CMP-SIGN-002",
    complianceItemRef: "KNW-CMP-002",
    signoffRole: "release-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Dependency compliance signoff",
  },
  {
    id: "KNW-CMP-SIGN-003",
    complianceItemRef: "KNW-CMP-003",
    signoffRole: "governance",
    signoffStatus: "signed",
    required: true,
    description: "Policy gate compliance signoff",
  },
  {
    id: "KNW-CMP-SIGN-004",
    complianceItemRef: "KNW-CMP-004",
    signoffRole: "platform-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Compatibility compliance signoff",
  },
  {
    id: "KNW-CMP-SIGN-005",
    complianceItemRef: "KNW-CMP-005",
    signoffRole: "governance",
    signoffStatus: "signed",
    required: true,
    description: "Governance compliance signoff",
  },
  {
    id: "KNW-CMP-SIGN-006",
    complianceItemRef: "KNW-CMP-006",
    signoffRole: "product-engineering",
    signoffStatus: "required",
    required: true,
    description: "Lifecycle compliance signoff pending",
  },
  {
    id: "KNW-CMP-SIGN-007",
    complianceItemRef: "KNW-CMP-007",
    signoffRole: "governance",
    signoffStatus: "signed",
    required: false,
    description: "Compliance audit signoff",
  },
  {
    id: "KNW-CMP-SIGN-008",
    complianceItemRef: "KNW-CMP-008",
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

export function isKnowledgeComplianceRefsAligned(): boolean {
  const knowledgeIds = new Set(KNOWLEDGE_CATALOG.map((k) => k.id));
  const lifecycleIds = new Set(LIFECYCLE_STATE_CATALOG.map((s) => s.id));
  const itemIds = new Set(COMPLIANCE_ITEM_CATALOG.map((i) => i.id));
  const exceptionIds = new Set(COMPLIANCE_EXCEPTION_CATALOG.map((e) => e.id));
  const auditIds = new Set(COMPLIANCE_AUDIT_TRAIL_CATALOG.map((a) => a.id));
  const gateIds = new Set(COMPLIANCE_FREEZE_GATE_CATALOG.map((g) => g.id));
  const signoffIds = new Set(COMPLIANCE_SIGNOFF_CATALOG.map((s) => s.id));
  const governanceRuleCount = GOVERNANCE_RULE_CATALOG.length;

  const itemsAligned = COMPLIANCE_ITEM_CATALOG.every(
    (i) =>
      knowledgeIds.has(i.knowledgeRef) &&
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
    version: V73_KNOWLEDGE_COMPLIANCE_VERSION,
    itemCount: items.length,
    passedCount,
    failedCount,
    checklistComplete,
    items,
    summary: [
      `knowledge-compliance-checklist count=${items.length}`,
      `passed=${passedCount}`,
      `failed=${failedCount}`,
      `complete=${checklistComplete}`,
    ].join(" "),
  };
}

export function buildComplianceExceptionManifest(): ExceptionManifest {
  const exceptions = COMPLIANCE_EXCEPTION_CATALOG;
  const catalogComplete = exceptions.length >= 6;

  return {
    version: V73_KNOWLEDGE_COMPLIANCE_VERSION,
    entryCount: exceptions.length,
    catalogComplete,
    exceptions,
    summary: [
      `knowledge-compliance-exceptions count=${exceptions.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildComplianceAuditTrailManifest(): AuditTrailManifest {
  const trails = COMPLIANCE_AUDIT_TRAIL_CATALOG;
  const catalogComplete = trails.length >= 6;

  return {
    version: V73_KNOWLEDGE_COMPLIANCE_VERSION,
    entryCount: trails.length,
    catalogComplete,
    trails,
    summary: [
      `knowledge-compliance-audit-trails count=${trails.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildComplianceFreezeGateManifest(): FreezeGateManifest {
  const gates = COMPLIANCE_FREEZE_GATE_CATALOG;
  const catalogComplete = gates.length >= 6;

  return {
    version: V73_KNOWLEDGE_COMPLIANCE_VERSION,
    gateCount: gates.length,
    catalogComplete,
    gates,
    summary: [
      `knowledge-freeze-gates count=${gates.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildComplianceSignoffManifest(): SignoffManifest {
  const signoffs = COMPLIANCE_SIGNOFF_CATALOG;
  const catalogComplete = signoffs.length >= 6;

  return {
    version: V73_KNOWLEDGE_COMPLIANCE_VERSION,
    entryCount: signoffs.length,
    catalogComplete,
    signoffs,
    summary: [
      `knowledge-compliance-signoffs count=${signoffs.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getComplianceItemById(id: string): ComplianceItem | undefined {
  return COMPLIANCE_ITEM_CATALOG.find((i) => i.id === id);
}

export function getComplianceItemsByKnowledgeRef(knowledgeRef: string): ComplianceItem[] {
  return COMPLIANCE_ITEM_CATALOG.filter((i) => i.knowledgeRef === knowledgeRef);
}

export function getFreezeGateByItemRef(complianceItemRef: string): FreezeGate | undefined {
  return COMPLIANCE_FREEZE_GATE_CATALOG.find((g) => g.complianceItemRef === complianceItemRef);
}

export function getSignoffByItemRef(complianceItemRef: string): Signoff | undefined {
  return COMPLIANCE_SIGNOFF_CATALOG.find((s) => s.complianceItemRef === complianceItemRef);
}

export function computeDeclarativeCompliancePass(input: {
  required: Required;
  passed: Passed;
  failed: Failed;
}): boolean {
  if (!input.required) return true;
  return input.passed && !input.failed;
}
