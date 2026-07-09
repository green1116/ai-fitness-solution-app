/**
 * V70 P7 — Delivery compliance checklist (declarative)
 */
import { LIFECYCLE_STATE_CATALOG } from "./lifecycle.states";
import { POLICY_RULE_CATALOG } from "./policy.rules";
import { RELEASE_CATALOG } from "./release.catalog";
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
} from "./delivery.compliance";
import { V70_DELIVERY_COMPLIANCE_VERSION } from "./delivery.compliance";

export const COMPLIANCE_ITEM_CATALOG: ComplianceItem[] = [
  {
    id: "DLV-CMP-001",
    releaseRef: "DLV-REL-001",
    lifecycleStateRef: "DLV-LCS-001",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v69-technical-governance PASS",
    review: "approved",
    exception: "DLV-CMP-EXC-001",
    auditTrail: "DLV-CMP-AUD-001",
    freezeGate: "DLV-CMP-GATE-001",
    signoff: "DLV-CMP-SIGN-001",
    description: "Technical governance baseline compliance",
  },
  {
    id: "DLV-CMP-002",
    releaseRef: "DLV-REL-002",
    lifecycleStateRef: "DLV-LCS-002",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v68-platform PASS",
    review: "approved",
    exception: "DLV-CMP-EXC-002",
    auditTrail: "DLV-CMP-AUD-002",
    freezeGate: "DLV-CMP-GATE-002",
    signoff: "DLV-CMP-SIGN-002",
    description: "Platform governance baseline compliance",
  },
  {
    id: "DLV-CMP-003",
    releaseRef: "DLV-REL-003",
    lifecycleStateRef: "DLV-LCS-003",
    required: true,
    passed: true,
    failed: false,
    evidence: "application runtime health ok",
    review: "approved",
    exception: "DLV-CMP-EXC-003",
    auditTrail: "DLV-CMP-AUD-003",
    freezeGate: "DLV-CMP-GATE-003",
    signoff: "DLV-CMP-SIGN-003",
    description: "Application runtime compliance",
  },
  {
    id: "DLV-CMP-004",
    releaseRef: "DLV-REL-004",
    lifecycleStateRef: "DLV-LCS-004",
    required: true,
    passed: true,
    failed: false,
    evidence: "api contract tests pass",
    review: "approved",
    exception: "DLV-CMP-EXC-004",
    auditTrail: "DLV-CMP-AUD-004",
    freezeGate: "DLV-CMP-GATE-004",
    signoff: "DLV-CMP-SIGN-004",
    description: "API surface compliance",
  },
  {
    id: "DLV-CMP-005",
    releaseRef: "DLV-REL-005",
    lifecycleStateRef: "DLV-LCS-005",
    required: true,
    passed: true,
    failed: false,
    evidence: "verify:v70-p1-release-catalog PASS",
    review: "approved",
    exception: "DLV-CMP-EXC-005",
    auditTrail: "DLV-CMP-AUD-005",
    freezeGate: "DLV-CMP-GATE-005",
    signoff: "DLV-CMP-SIGN-005",
    description: "Delivery lifecycle foundation compliance",
  },
  {
    id: "DLV-CMP-006",
    releaseRef: "DLV-REL-006",
    lifecycleStateRef: "DLV-LCS-006",
    required: true,
    passed: true,
    failed: false,
    evidence: "staging smoke tests pass",
    review: "pending",
    exception: "DLV-CMP-EXC-006",
    auditTrail: "DLV-CMP-AUD-006",
    freezeGate: "DLV-CMP-GATE-006",
    signoff: "DLV-CMP-SIGN-006",
    description: "Staging candidate compliance",
  },
  {
    id: "DLV-CMP-007",
    releaseRef: "DLV-REL-007",
    lifecycleStateRef: "DLV-LCS-007",
    required: false,
    passed: true,
    failed: false,
    evidence: "canary SLO within bounds",
    review: "waived",
    exception: "DLV-CMP-EXC-007",
    auditTrail: "DLV-CMP-AUD-007",
    freezeGate: "DLV-CMP-GATE-007",
    signoff: "DLV-CMP-SIGN-007",
    description: "Canary probe compliance",
  },
  {
    id: "DLV-CMP-008",
    releaseRef: "DLV-REL-008",
    lifecycleStateRef: "DLV-LCS-008",
    required: true,
    passed: true,
    failed: false,
    evidence: "archived — no active deployment",
    review: "approved",
    exception: "DLV-CMP-EXC-008",
    auditTrail: "DLV-CMP-AUD-008",
    freezeGate: "DLV-CMP-GATE-008",
    signoff: "DLV-CMP-SIGN-008",
    description: "Legacy portal archived compliance",
  },
];

export const COMPLIANCE_EXCEPTION_CATALOG: ComplianceException[] = [
  {
    id: "DLV-CMP-EXC-001",
    complianceItemRef: "DLV-CMP-001",
    exceptionKind: "governance-waiver",
    status: "rejected",
    required: true,
    description: "Governance waiver rejected",
  },
  {
    id: "DLV-CMP-EXC-002",
    complianceItemRef: "DLV-CMP-002",
    exceptionKind: "platform-waiver",
    status: "rejected",
    required: true,
    description: "Platform waiver rejected",
  },
  {
    id: "DLV-CMP-EXC-003",
    complianceItemRef: "DLV-CMP-003",
    exceptionKind: "runtime-waiver",
    status: "rejected",
    required: true,
    description: "Runtime waiver rejected",
  },
  {
    id: "DLV-CMP-EXC-004",
    complianceItemRef: "DLV-CMP-004",
    exceptionKind: "api-waiver",
    status: "pending",
    required: true,
    description: "API waiver pending review",
  },
  {
    id: "DLV-CMP-EXC-005",
    complianceItemRef: "DLV-CMP-005",
    exceptionKind: "catalog-waiver",
    status: "rejected",
    required: true,
    description: "Catalog waiver rejected",
  },
  {
    id: "DLV-CMP-EXC-006",
    complianceItemRef: "DLV-CMP-006",
    exceptionKind: "staging-waiver",
    status: "pending",
    required: true,
    description: "Staging waiver pending",
  },
  {
    id: "DLV-CMP-EXC-007",
    complianceItemRef: "DLV-CMP-007",
    exceptionKind: "canary-waiver",
    status: "approved",
    required: true,
    description: "Canary waiver approved template",
  },
  {
    id: "DLV-CMP-EXC-008",
    complianceItemRef: "DLV-CMP-008",
    exceptionKind: "archive-waiver",
    status: "rejected",
    required: true,
    description: "Archive waiver rejected",
  },
];

export const COMPLIANCE_AUDIT_TRAIL_CATALOG: ComplianceAuditTrail[] = [
  {
    id: "DLV-CMP-AUD-001",
    complianceItemRef: "DLV-CMP-001",
    event: "delivery.compliance.governance",
    retention: "365d",
    required: true,
    description: "Governance compliance audit trail",
  },
  {
    id: "DLV-CMP-AUD-002",
    complianceItemRef: "DLV-CMP-002",
    event: "delivery.compliance.platform",
    retention: "365d",
    required: true,
    description: "Platform compliance audit trail",
  },
  {
    id: "DLV-CMP-AUD-003",
    complianceItemRef: "DLV-CMP-003",
    event: "delivery.compliance.runtime",
    retention: "90d",
    required: true,
    description: "Runtime compliance audit trail",
  },
  {
    id: "DLV-CMP-AUD-004",
    complianceItemRef: "DLV-CMP-004",
    event: "delivery.compliance.api",
    retention: "90d",
    required: true,
    description: "API compliance audit trail",
  },
  {
    id: "DLV-CMP-AUD-005",
    complianceItemRef: "DLV-CMP-005",
    event: "delivery.compliance.catalog",
    retention: "180d",
    required: true,
    description: "Catalog compliance audit trail",
  },
  {
    id: "DLV-CMP-AUD-006",
    complianceItemRef: "DLV-CMP-006",
    event: "delivery.compliance.staging",
    retention: "30d",
    required: true,
    description: "Staging compliance audit trail",
  },
  {
    id: "DLV-CMP-AUD-007",
    complianceItemRef: "DLV-CMP-007",
    event: "delivery.compliance.canary",
    retention: "14d",
    required: true,
    description: "Canary compliance audit trail",
  },
  {
    id: "DLV-CMP-AUD-008",
    complianceItemRef: "DLV-CMP-008",
    event: "delivery.compliance.archive",
    retention: "730d",
    required: true,
    description: "Archive compliance audit trail",
  },
];

export const FREEZE_GATE_CATALOG: FreezeGate[] = [
  {
    id: "DLV-CMP-GATE-001",
    complianceItemRef: "DLV-CMP-001",
    gateKind: "governance-freeze",
    verifyScript: "npm run verify:v69-technical-governance",
    required: true,
    description: "Technical governance freeze gate",
  },
  {
    id: "DLV-CMP-GATE-002",
    complianceItemRef: "DLV-CMP-002",
    gateKind: "platform-freeze",
    verifyScript: "npm run verify:v68-platform",
    required: true,
    description: "Platform freeze gate",
  },
  {
    id: "DLV-CMP-GATE-003",
    complianceItemRef: "DLV-CMP-003",
    gateKind: "runtime-health",
    verifyScript: "npx tsc --noEmit",
    required: true,
    description: "Runtime compile freeze gate",
  },
  {
    id: "DLV-CMP-GATE-004",
    complianceItemRef: "DLV-CMP-004",
    gateKind: "api-contract",
    verifyScript: "declarative:api-contract-pass",
    required: true,
    description: "API contract freeze gate",
  },
  {
    id: "DLV-CMP-GATE-005",
    complianceItemRef: "DLV-CMP-005",
    gateKind: "delivery-catalog",
    verifyScript: "npx tsx scripts/verify-v70-p1-release-catalog.ts",
    required: true,
    description: "Delivery catalog freeze gate",
  },
  {
    id: "DLV-CMP-GATE-006",
    complianceItemRef: "DLV-CMP-006",
    gateKind: "staging-verify",
    verifyScript: "declarative:staging-smoke-pass",
    required: true,
    description: "Staging freeze gate",
  },
  {
    id: "DLV-CMP-GATE-007",
    complianceItemRef: "DLV-CMP-007",
    gateKind: "canary-slo",
    verifyScript: "declarative:canary-slo-pass",
    required: false,
    description: "Canary SLO freeze gate",
  },
  {
    id: "DLV-CMP-GATE-008",
    complianceItemRef: "DLV-CMP-008",
    gateKind: "archive-terminal",
    verifyScript: "declarative:archive-terminal",
    required: true,
    description: "Archive terminal freeze gate",
  },
];

export const COMPLIANCE_SIGNOFF_CATALOG: ComplianceSignoff[] = [
  {
    id: "DLV-CMP-SIGN-001",
    complianceItemRef: "DLV-CMP-001",
    signoffRole: "platform-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Governance compliance signoff",
  },
  {
    id: "DLV-CMP-SIGN-002",
    complianceItemRef: "DLV-CMP-002",
    signoffRole: "platform-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Platform compliance signoff",
  },
  {
    id: "DLV-CMP-SIGN-003",
    complianceItemRef: "DLV-CMP-003",
    signoffRole: "product-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Runtime compliance signoff",
  },
  {
    id: "DLV-CMP-SIGN-004",
    complianceItemRef: "DLV-CMP-004",
    signoffRole: "api-platform",
    signoffStatus: "signed",
    required: true,
    description: "API compliance signoff",
  },
  {
    id: "DLV-CMP-SIGN-005",
    complianceItemRef: "DLV-CMP-005",
    signoffRole: "release-engineering",
    signoffStatus: "signed",
    required: true,
    description: "Delivery foundation signoff",
  },
  {
    id: "DLV-CMP-SIGN-006",
    complianceItemRef: "DLV-CMP-006",
    signoffRole: "release-engineering",
    signoffStatus: "required",
    required: true,
    description: "Staging compliance signoff pending",
  },
  {
    id: "DLV-CMP-SIGN-007",
    complianceItemRef: "DLV-CMP-007",
    signoffRole: "sre",
    signoffStatus: "signed",
    required: false,
    description: "Canary compliance signoff",
  },
  {
    id: "DLV-CMP-SIGN-008",
    complianceItemRef: "DLV-CMP-008",
    signoffRole: "product-engineering",
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

export function isDeliveryComplianceRefsAligned(): boolean {
  const releaseIds = new Set(RELEASE_CATALOG.map((r) => r.id));
  const lifecycleIds = new Set(LIFECYCLE_STATE_CATALOG.map((s) => s.id));
  const itemIds = new Set(COMPLIANCE_ITEM_CATALOG.map((i) => i.id));
  const exceptionIds = new Set(COMPLIANCE_EXCEPTION_CATALOG.map((e) => e.id));
  const auditIds = new Set(COMPLIANCE_AUDIT_TRAIL_CATALOG.map((a) => a.id));
  const gateIds = new Set(FREEZE_GATE_CATALOG.map((g) => g.id));
  const signoffIds = new Set(COMPLIANCE_SIGNOFF_CATALOG.map((s) => s.id));
  const policyIds = new Set(POLICY_RULE_CATALOG.map((p) => p.id));

  const itemsAligned = COMPLIANCE_ITEM_CATALOG.every(
    (i) =>
      releaseIds.has(i.releaseRef) &&
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
    FREEZE_GATE_CATALOG.every((g) => itemIds.has(g.complianceItemRef)) &&
    COMPLIANCE_SIGNOFF_CATALOG.every((s) => itemIds.has(s.complianceItemRef));

  const coverageComplete =
    COMPLIANCE_ITEM_CATALOG.length >= 6 &&
    policyIds.size >= 6 &&
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
    version: V70_DELIVERY_COMPLIANCE_VERSION,
    itemCount: items.length,
    passedCount,
    failedCount,
    checklistComplete,
    items,
    summary: [
      `compliance-checklist count=${items.length}`,
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
    version: V70_DELIVERY_COMPLIANCE_VERSION,
    entryCount: exceptions.length,
    catalogComplete,
    exceptions,
    summary: [
      `compliance-exceptions count=${exceptions.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildComplianceAuditTrailManifest(): ComplianceAuditTrailManifest {
  const trails = COMPLIANCE_AUDIT_TRAIL_CATALOG;
  const catalogComplete = trails.length >= 6;

  return {
    version: V70_DELIVERY_COMPLIANCE_VERSION,
    entryCount: trails.length,
    catalogComplete,
    trails,
    summary: [
      `compliance-audit-trails count=${trails.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildFreezeGateManifest(): FreezeGateManifest {
  const gates = FREEZE_GATE_CATALOG;
  const catalogComplete = gates.length >= 6;

  return {
    version: V70_DELIVERY_COMPLIANCE_VERSION,
    gateCount: gates.length,
    catalogComplete,
    gates,
    summary: [
      `freeze-gates count=${gates.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildComplianceSignoffManifest(): ComplianceSignoffManifest {
  const signoffs = COMPLIANCE_SIGNOFF_CATALOG;
  const catalogComplete = signoffs.length >= 6;

  return {
    version: V70_DELIVERY_COMPLIANCE_VERSION,
    entryCount: signoffs.length,
    catalogComplete,
    signoffs,
    summary: [
      `compliance-signoffs count=${signoffs.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getComplianceItemById(id: string): ComplianceItem | undefined {
  return COMPLIANCE_ITEM_CATALOG.find((i) => i.id === id);
}

export function getComplianceItemsByReleaseRef(
  releaseRef: string,
): ComplianceItem[] {
  return COMPLIANCE_ITEM_CATALOG.filter((i) => i.releaseRef === releaseRef);
}

export function getFreezeGateByItemRef(
  complianceItemRef: string,
): FreezeGate | undefined {
  return FREEZE_GATE_CATALOG.find((g) => g.complianceItemRef === complianceItemRef);
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
