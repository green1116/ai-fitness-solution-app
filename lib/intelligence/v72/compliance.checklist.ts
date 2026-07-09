/**
 * V72 P7 — Intelligence compliance checklist (declarative)
 */
import { GOVERNANCE_RULE_CATALOG } from "./governance.rules";
import { INTELLIGENCE_CATALOG } from "./intelligence.catalog";
import { LIFECYCLE_STATE_CATALOG } from "./lifecycle.states";
import type {
  AuditTrail,
  AuditTrailManifest,
  ComplianceChecklistManifest,
  ComplianceItem,
  Exception,
  ExceptionManifest,
  FreezeGate,
  FreezeGateManifest,
  Signoff,
  SignoffManifest,
} from "./intelligence.compliance";
import { V72_INTELLIGENCE_COMPLIANCE_VERSION } from "./intelligence.compliance";

export const COMPLIANCE_ITEM_CATALOG: ComplianceItem[] = [
  {
    id: "INT-CMP-001",
    intelligenceRef: "INT-001",
    lifecycleStateRef: "INT-LCS-001",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v71-workflow-freeze-1 PASS",
    review: "approved",
    exception: "INT-CMP-EXC-001",
    auditTrail: "INT-CMP-AUD-001",
    freezeGate: "INT-CMP-GATE-001",
    signoff: "INT-CMP-SIGN-001",
    description: "Orchestration baseline insight compliance",
  },
  {
    id: "INT-CMP-002",
    intelligenceRef: "INT-002",
    lifecycleStateRef: "INT-LCS-002",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v72-p2-signal-dependency PASS",
    review: "approved",
    exception: "INT-CMP-EXC-002",
    auditTrail: "INT-CMP-AUD-002",
    freezeGate: "INT-CMP-GATE-002",
    signoff: "INT-CMP-SIGN-002",
    description: "Dependency acyclic signal compliance",
  },
  {
    id: "INT-CMP-003",
    intelligenceRef: "INT-003",
    lifecycleStateRef: "INT-LCS-003",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v72-p3-intelligence-policy PASS",
    review: "approved",
    exception: "INT-CMP-EXC-003",
    auditTrail: "INT-CMP-AUD-003",
    freezeGate: "INT-CMP-GATE-003",
    signoff: "INT-CMP-SIGN-003",
    description: "Policy gate insight compliance",
  },
  {
    id: "INT-CMP-004",
    intelligenceRef: "INT-004",
    lifecycleStateRef: "INT-LCS-004",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v72-p4-intelligence-compatibility PASS",
    review: "approved",
    exception: "INT-CMP-EXC-004",
    auditTrail: "INT-CMP-AUD-004",
    freezeGate: "INT-CMP-GATE-004",
    signoff: "INT-CMP-SIGN-004",
    description: "Compatibility matrix insight compliance",
  },
  {
    id: "INT-CMP-005",
    intelligenceRef: "INT-005",
    lifecycleStateRef: "INT-LCS-005",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v72-p5-intelligence-governance PASS",
    review: "approved",
    exception: "INT-CMP-EXC-005",
    auditTrail: "INT-CMP-AUD-005",
    freezeGate: "INT-CMP-GATE-005",
    signoff: "INT-CMP-SIGN-005",
    description: "Governance risk escalation signal compliance",
  },
  {
    id: "INT-CMP-006",
    intelligenceRef: "INT-006",
    lifecycleStateRef: "INT-LCS-006",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v72-p6-intelligence-lifecycle PASS",
    review: "pending",
    exception: "INT-CMP-EXC-006",
    auditTrail: "INT-CMP-AUD-006",
    freezeGate: "INT-CMP-GATE-006",
    signoff: "INT-CMP-SIGN-006",
    description: "Lifecycle transition signal compliance",
  },
  {
    id: "INT-CMP-007",
    intelligenceRef: "INT-007",
    lifecycleStateRef: "INT-LCS-007",
    required: false,
    passed: true,
    failed: false,
    evidence: "compliance audit webhook pass",
    review: "waived",
    exception: "INT-CMP-EXC-007",
    auditTrail: "INT-CMP-AUD-007",
    freezeGate: "INT-CMP-GATE-007",
    signoff: "INT-CMP-SIGN-007",
    description: "Compliance audit metric compliance",
  },
  {
    id: "INT-CMP-008",
    intelligenceRef: "INT-008",
    lifecycleStateRef: "INT-LCS-008",
    required: true,
    passed: true,
    failed: false,
    evidence: "archived — no active intelligence",
    review: "approved",
    exception: "INT-CMP-EXC-008",
    auditTrail: "INT-CMP-AUD-008",
    freezeGate: "INT-CMP-GATE-008",
    signoff: "INT-CMP-SIGN-008",
    description: "Sign-off freeze insight archived compliance",
  },
];

export const COMPLIANCE_EXCEPTION_CATALOG: Exception[] = [
  {
    id: "INT-CMP-EXC-001",
    complianceItemRef: "INT-CMP-001",
    exceptionKind: "insight-waiver",
    status: "rejected",
    required: true,
    description: "Orchestration baseline waiver rejected",
  },
  {
    id: "INT-CMP-EXC-002",
    complianceItemRef: "INT-CMP-002",
    exceptionKind: "dependency-waiver",
    status: "rejected",
    required: true,
    description: "Dependency acyclic waiver rejected",
  },
  {
    id: "INT-CMP-EXC-003",
    complianceItemRef: "INT-CMP-003",
    exceptionKind: "policy-waiver",
    status: "rejected",
    required: true,
    description: "Policy gate waiver rejected",
  },
  {
    id: "INT-CMP-EXC-004",
    complianceItemRef: "INT-CMP-004",
    exceptionKind: "compatibility-waiver",
    status: "pending",
    required: true,
    description: "Compatibility matrix waiver pending",
  },
  {
    id: "INT-CMP-EXC-005",
    complianceItemRef: "INT-CMP-005",
    exceptionKind: "governance-waiver",
    status: "rejected",
    required: true,
    description: "Governance waiver rejected",
  },
  {
    id: "INT-CMP-EXC-006",
    complianceItemRef: "INT-CMP-006",
    exceptionKind: "lifecycle-waiver",
    status: "pending",
    required: true,
    description: "Lifecycle transition waiver pending",
  },
  {
    id: "INT-CMP-EXC-007",
    complianceItemRef: "INT-CMP-007",
    exceptionKind: "audit-waiver",
    status: "approved",
    required: true,
    description: "Compliance audit waiver approved template",
  },
  {
    id: "INT-CMP-EXC-008",
    complianceItemRef: "INT-CMP-008",
    exceptionKind: "archive-waiver",
    status: "rejected",
    required: true,
    description: "Archive waiver rejected",
  },
];

export const COMPLIANCE_AUDIT_TRAIL_CATALOG: AuditTrail[] = [
  {
    id: "INT-CMP-AUD-001",
    complianceItemRef: "INT-CMP-001",
    event: "intelligence.compliance.catalog",
    retention: "365d",
    required: true,
    description: "Orchestration baseline compliance audit trail",
  },
  {
    id: "INT-CMP-AUD-002",
    complianceItemRef: "INT-CMP-002",
    event: "intelligence.compliance.dependency",
    retention: "180d",
    required: true,
    description: "Dependency compliance audit trail",
  },
  {
    id: "INT-CMP-AUD-003",
    complianceItemRef: "INT-CMP-003",
    event: "intelligence.compliance.policy",
    retention: "180d",
    required: true,
    description: "Policy gate compliance audit trail",
  },
  {
    id: "INT-CMP-AUD-004",
    complianceItemRef: "INT-CMP-004",
    event: "intelligence.compliance.compatibility",
    retention: "180d",
    required: true,
    description: "Compatibility compliance audit trail",
  },
  {
    id: "INT-CMP-AUD-005",
    complianceItemRef: "INT-CMP-005",
    event: "intelligence.compliance.governance",
    retention: "365d",
    required: true,
    description: "Governance compliance audit trail",
  },
  {
    id: "INT-CMP-AUD-006",
    complianceItemRef: "INT-CMP-006",
    event: "intelligence.compliance.lifecycle",
    retention: "90d",
    required: true,
    description: "Lifecycle compliance audit trail",
  },
  {
    id: "INT-CMP-AUD-007",
    complianceItemRef: "INT-CMP-007",
    event: "intelligence.compliance.audit",
    retention: "30d",
    required: true,
    description: "Compliance audit trail",
  },
  {
    id: "INT-CMP-AUD-008",
    complianceItemRef: "INT-CMP-008",
    event: "intelligence.compliance.archive",
    retention: "730d",
    required: true,
    description: "Archive compliance audit trail",
  },
];

export const COMPLIANCE_FREEZE_GATE_CATALOG: FreezeGate[] = [
  {
    id: "INT-CMP-GATE-001",
    complianceItemRef: "INT-CMP-001",
    gateKind: "intelligence-catalog",
    verifyScript: "npx tsx scripts/verify-v72-p1-intelligence-catalog.ts",
    required: true,
    description: "Intelligence catalog freeze gate",
  },
  {
    id: "INT-CMP-GATE-002",
    complianceItemRef: "INT-CMP-002",
    gateKind: "signal-dependency",
    verifyScript: "npx tsx scripts/verify-v72-p2-signal-dependency.ts",
    required: true,
    description: "Signal dependency freeze gate",
  },
  {
    id: "INT-CMP-GATE-003",
    complianceItemRef: "INT-CMP-003",
    gateKind: "intelligence-policy",
    verifyScript: "npx tsx scripts/verify-v72-p3-intelligence-policy.ts",
    required: true,
    description: "Intelligence policy freeze gate",
  },
  {
    id: "INT-CMP-GATE-004",
    complianceItemRef: "INT-CMP-004",
    gateKind: "intelligence-compatibility",
    verifyScript: "npx tsx scripts/verify-v72-p4-intelligence-compatibility.ts",
    required: true,
    description: "Intelligence compatibility freeze gate",
  },
  {
    id: "INT-CMP-GATE-005",
    complianceItemRef: "INT-CMP-005",
    gateKind: "intelligence-governance",
    verifyScript: "npx tsx scripts/verify-v72-p5-intelligence-governance.ts",
    required: true,
    description: "Intelligence governance freeze gate",
  },
  {
    id: "INT-CMP-GATE-006",
    complianceItemRef: "INT-CMP-006",
    gateKind: "intelligence-lifecycle",
    verifyScript: "npx tsx scripts/verify-v72-p6-intelligence-lifecycle.ts",
    required: true,
    description: "Intelligence lifecycle freeze gate",
  },
  {
    id: "INT-CMP-GATE-007",
    complianceItemRef: "INT-CMP-007",
    gateKind: "compliance-audit",
    verifyScript: "declarative:compliance-audit-pass",
    required: false,
    description: "Compliance audit freeze gate",
  },
  {
    id: "INT-CMP-GATE-008",
    complianceItemRef: "INT-CMP-008",
    gateKind: "archive-terminal",
    verifyScript: "declarative:archive-terminal",
    required: true,
    description: "Archive terminal freeze gate",
  },
];

export const COMPLIANCE_SIGNOFF_CATALOG: Signoff[] = [
  {
    id: "INT-CMP-SIGN-001",
    complianceItemRef: "INT-CMP-001",
    signoffRole: "platform-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Orchestration baseline compliance signoff",
  },
  {
    id: "INT-CMP-SIGN-002",
    complianceItemRef: "INT-CMP-002",
    signoffRole: "release-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Dependency compliance signoff",
  },
  {
    id: "INT-CMP-SIGN-003",
    complianceItemRef: "INT-CMP-003",
    signoffRole: "governance",
    signoffStatus: "signed",
    required: true,
    description: "Policy gate compliance signoff",
  },
  {
    id: "INT-CMP-SIGN-004",
    complianceItemRef: "INT-CMP-004",
    signoffRole: "platform-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Compatibility compliance signoff",
  },
  {
    id: "INT-CMP-SIGN-005",
    complianceItemRef: "INT-CMP-005",
    signoffRole: "governance",
    signoffStatus: "signed",
    required: true,
    description: "Governance compliance signoff",
  },
  {
    id: "INT-CMP-SIGN-006",
    complianceItemRef: "INT-CMP-006",
    signoffRole: "product-engineering",
    signoffStatus: "required",
    required: true,
    description: "Lifecycle compliance signoff pending",
  },
  {
    id: "INT-CMP-SIGN-007",
    complianceItemRef: "INT-CMP-007",
    signoffRole: "governance",
    signoffStatus: "signed",
    required: false,
    description: "Compliance audit signoff",
  },
  {
    id: "INT-CMP-SIGN-008",
    complianceItemRef: "INT-CMP-008",
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

export function isIntelligenceComplianceRefsAligned(): boolean {
  const intelligenceIds = new Set(INTELLIGENCE_CATALOG.map((i) => i.id));
  const lifecycleIds = new Set(LIFECYCLE_STATE_CATALOG.map((s) => s.id));
  const itemIds = new Set(COMPLIANCE_ITEM_CATALOG.map((i) => i.id));
  const exceptionIds = new Set(COMPLIANCE_EXCEPTION_CATALOG.map((e) => e.id));
  const auditIds = new Set(COMPLIANCE_AUDIT_TRAIL_CATALOG.map((a) => a.id));
  const gateIds = new Set(COMPLIANCE_FREEZE_GATE_CATALOG.map((g) => g.id));
  const signoffIds = new Set(COMPLIANCE_SIGNOFF_CATALOG.map((s) => s.id));
  const governanceRuleCount = GOVERNANCE_RULE_CATALOG.length;

  const itemsAligned = COMPLIANCE_ITEM_CATALOG.every(
    (i) =>
      intelligenceIds.has(i.intelligenceRef) &&
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
    version: V72_INTELLIGENCE_COMPLIANCE_VERSION,
    itemCount: items.length,
    passedCount,
    failedCount,
    checklistComplete,
    items,
    summary: [
      `intelligence-compliance-checklist count=${items.length}`,
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
    version: V72_INTELLIGENCE_COMPLIANCE_VERSION,
    entryCount: exceptions.length,
    catalogComplete,
    exceptions,
    summary: [
      `intelligence-compliance-exceptions count=${exceptions.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildComplianceAuditTrailManifest(): AuditTrailManifest {
  const trails = COMPLIANCE_AUDIT_TRAIL_CATALOG;
  const catalogComplete = trails.length >= 6;

  return {
    version: V72_INTELLIGENCE_COMPLIANCE_VERSION,
    entryCount: trails.length,
    catalogComplete,
    trails,
    summary: [
      `intelligence-compliance-audit-trails count=${trails.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildFreezeGateManifest(): FreezeGateManifest {
  const gates = COMPLIANCE_FREEZE_GATE_CATALOG;
  const catalogComplete = gates.length >= 6;

  return {
    version: V72_INTELLIGENCE_COMPLIANCE_VERSION,
    gateCount: gates.length,
    catalogComplete,
    gates,
    summary: [
      `intelligence-freeze-gates count=${gates.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildComplianceSignoffManifest(): SignoffManifest {
  const signoffs = COMPLIANCE_SIGNOFF_CATALOG;
  const catalogComplete = signoffs.length >= 6;

  return {
    version: V72_INTELLIGENCE_COMPLIANCE_VERSION,
    entryCount: signoffs.length,
    catalogComplete,
    signoffs,
    summary: [
      `intelligence-compliance-signoffs count=${signoffs.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getComplianceItemById(id: string): ComplianceItem | undefined {
  return COMPLIANCE_ITEM_CATALOG.find((i) => i.id === id);
}

export function getComplianceItemsByIntelligenceRef(
  intelligenceRef: string,
): ComplianceItem[] {
  return COMPLIANCE_ITEM_CATALOG.filter((i) => i.intelligenceRef === intelligenceRef);
}

export function getFreezeGateByItemRef(complianceItemRef: string): FreezeGate | undefined {
  return COMPLIANCE_FREEZE_GATE_CATALOG.find((g) => g.complianceItemRef === complianceItemRef);
}

export function getSignoffByItemRef(complianceItemRef: string): Signoff | undefined {
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
