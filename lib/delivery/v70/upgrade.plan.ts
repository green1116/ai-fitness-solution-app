/**
 * V70 P5 — Upgrade plan catalog (declarative)
 */
import { RELEASE_CATALOG } from "./release.catalog";
import { VERSION_PAIR_CATALOG } from "./compatibility.matrix";
import type {
  PostCheck,
  PostCheckManifest,
  PreCheck,
  PreCheckManifest,
  RollbackPlan,
  RollbackPlanManifest,
  UpgradePath,
  UpgradePathManifest,
  UpgradePlan,
  UpgradePlanManifest,
} from "./upgrade.governance";
import { V70_UPGRADE_GOVERNANCE_VERSION } from "./upgrade.governance";

export const UPGRADE_PATH_CATALOG: UpgradePath[] = [
  {
    id: "DLV-UPG-PATH-001",
    fromReleaseRef: "DLV-REL-002",
    toReleaseRef: "DLV-REL-001",
    fromVersion: "v68-platform-freeze-1",
    toVersion: "v69-technical-governance-freeze-1",
    order: 1,
    required: true,
    description: "Platform to technical governance upgrade path",
  },
  {
    id: "DLV-UPG-PATH-002",
    fromReleaseRef: "DLV-REL-001",
    toReleaseRef: "DLV-REL-003",
    fromVersion: "v69-technical-governance-freeze-1",
    toVersion: "0.1.0",
    order: 2,
    required: true,
    description: "Governance to application runtime upgrade path",
  },
  {
    id: "DLV-UPG-PATH-003",
    fromReleaseRef: "DLV-REL-003",
    toReleaseRef: "DLV-REL-004",
    fromVersion: "0.1.0",
    toVersion: "0.1.0",
    order: 3,
    required: true,
    description: "Application to API surface upgrade path",
  },
  {
    id: "DLV-UPG-PATH-004",
    fromReleaseRef: "DLV-REL-003",
    toReleaseRef: "DLV-REL-006",
    fromVersion: "0.1.0",
    toVersion: "0.1.0-rc.1",
    order: 4,
    required: true,
    description: "Production to staging candidate upgrade path",
  },
  {
    id: "DLV-UPG-PATH-005",
    fromReleaseRef: "DLV-REL-006",
    toReleaseRef: "DLV-REL-007",
    fromVersion: "0.1.0-rc.1",
    toVersion: "0.1.0-canary.1",
    order: 5,
    required: false,
    description: "Staging to canary upgrade path",
  },
  {
    id: "DLV-UPG-PATH-006",
    fromReleaseRef: "DLV-REL-001",
    toReleaseRef: "DLV-REL-005",
    fromVersion: "v69-technical-governance-freeze-1",
    toVersion: "v70-release-catalog-1",
    order: 6,
    required: true,
    description: "Governance to delivery lifecycle upgrade path",
  },
  {
    id: "DLV-UPG-PATH-007",
    fromReleaseRef: "DLV-REL-006",
    toReleaseRef: "DLV-REL-003",
    fromVersion: "0.1.0-rc.1",
    toVersion: "0.1.0",
    order: 7,
    required: true,
    description: "Staging candidate promotion to production path",
  },
  {
    id: "DLV-UPG-PATH-008",
    fromReleaseRef: "DLV-REL-005",
    toReleaseRef: "DLV-REL-003",
    fromVersion: "v70-release-catalog-1",
    toVersion: "0.1.0",
    order: 8,
    required: true,
    description: "Delivery foundation to application channel path",
  },
];

export const UPGRADE_PLAN_CATALOG: UpgradePlan[] = [
  {
    id: "DLV-UPG-001",
    releaseRef: "DLV-REL-001",
    upgradePath: "DLV-UPG-PATH-001",
    preCheck: "DLV-UPG-PRE-001",
    postCheck: "DLV-UPG-PST-001",
    rollbackPlan: "DLV-UPG-RBK-001",
    compatibilityCheck: "DLV-VPX-001",
    approval: "approved",
    riskLevel: "medium",
    maintenanceWindow: "Sat 02:00-04:00 UTC",
    successCriteria: "governanceReady === true && readinessScore === 100",
    required: true,
    description: "Technical governance baseline upgrade plan",
  },
  {
    id: "DLV-UPG-002",
    releaseRef: "DLV-REL-003",
    upgradePath: "DLV-UPG-PATH-002",
    preCheck: "DLV-UPG-PRE-002",
    postCheck: "DLV-UPG-PST-002",
    rollbackPlan: "DLV-UPG-RBK-002",
    compatibilityCheck: "DLV-VPX-002",
    approval: "required",
    riskLevel: "high",
    maintenanceWindow: "Sun 01:00-03:00 UTC",
    successCriteria: "catalogReady === true && verify exit 0",
    required: true,
    description: "Application runtime upgrade plan",
  },
  {
    id: "DLV-UPG-003",
    releaseRef: "DLV-REL-004",
    upgradePath: "DLV-UPG-PATH-003",
    preCheck: "DLV-UPG-PRE-003",
    postCheck: "DLV-UPG-PST-003",
    rollbackPlan: "DLV-UPG-RBK-003",
    compatibilityCheck: "DLV-VPX-003",
    approval: "approved",
    riskLevel: "medium",
    maintenanceWindow: "Sun 03:00-04:00 UTC",
    successCriteria: "api contract tests pass",
    required: true,
    description: "API surface upgrade plan",
  },
  {
    id: "DLV-UPG-004",
    releaseRef: "DLV-REL-006",
    upgradePath: "DLV-UPG-PATH-004",
    preCheck: "DLV-UPG-PRE-004",
    postCheck: "DLV-UPG-PST-004",
    rollbackPlan: "DLV-UPG-RBK-004",
    compatibilityCheck: "DLV-VPX-005",
    approval: "required",
    riskLevel: "high",
    maintenanceWindow: "Wed 22:00-23:30 UTC",
    successCriteria: "staging verify pass && smoke tests pass",
    required: true,
    description: "Staging candidate upgrade plan",
  },
  {
    id: "DLV-UPG-005",
    releaseRef: "DLV-REL-007",
    upgradePath: "DLV-UPG-PATH-005",
    preCheck: "DLV-UPG-PRE-005",
    postCheck: "DLV-UPG-PST-005",
    rollbackPlan: "DLV-UPG-RBK-005",
    compatibilityCheck: "DLV-VPX-006",
    approval: "waived",
    riskLevel: "low",
    maintenanceWindow: "anytime-low-traffic",
    successCriteria: "canary metrics within SLO",
    required: true,
    description: "Canary probe upgrade plan",
  },
  {
    id: "DLV-UPG-006",
    releaseRef: "DLV-REL-005",
    upgradePath: "DLV-UPG-PATH-006",
    preCheck: "DLV-UPG-PRE-006",
    postCheck: "DLV-UPG-PST-006",
    rollbackPlan: "DLV-UPG-RBK-006",
    compatibilityCheck: "DLV-VPX-007",
    approval: "approved",
    riskLevel: "medium",
    maintenanceWindow: "Sat 04:00-05:00 UTC",
    successCriteria: "delivery catalog ready === true",
    required: true,
    description: "Delivery lifecycle foundation upgrade plan",
  },
  {
    id: "DLV-UPG-007",
    releaseRef: "DLV-REL-003",
    upgradePath: "DLV-UPG-PATH-007",
    preCheck: "DLV-UPG-PRE-007",
    postCheck: "DLV-UPG-PST-007",
    rollbackPlan: "DLV-UPG-RBK-007",
    compatibilityCheck: "DLV-VPX-005",
    approval: "required",
    riskLevel: "critical",
    maintenanceWindow: "Sun 00:00-02:00 UTC",
    successCriteria: "production promotion approved && rollback defined",
    required: true,
    description: "Staging to production promotion plan",
  },
  {
    id: "DLV-UPG-008",
    releaseRef: "DLV-REL-003",
    upgradePath: "DLV-UPG-PATH-008",
    preCheck: "DLV-UPG-PRE-008",
    postCheck: "DLV-UPG-PST-008",
    rollbackPlan: "DLV-UPG-RBK-008",
    compatibilityCheck: "DLV-VPX-008",
    approval: "approved",
    riskLevel: "low",
    maintenanceWindow: "internal-channel-anytime",
    successCriteria: "channel gate pass && compatibility matrix ok",
    required: true,
    description: "Delivery to application channel upgrade plan",
  },
];

export const PRE_CHECK_CATALOG: PreCheck[] = [
  {
    id: "DLV-UPG-PRE-001",
    upgradePlanRef: "DLV-UPG-001",
    checkKind: "freeze",
    passCondition: "upstream platform signedOff === true",
    required: true,
    description: "Platform freeze pre-check",
  },
  {
    id: "DLV-UPG-PRE-002",
    upgradePlanRef: "DLV-UPG-002",
    checkKind: "governance",
    passCondition: "technical governance ready",
    required: true,
    description: "Governance readiness pre-check",
  },
  {
    id: "DLV-UPG-PRE-003",
    upgradePlanRef: "DLV-UPG-003",
    checkKind: "dependency",
    passCondition: "application runtime active",
    required: true,
    description: "Runtime dependency pre-check",
  },
  {
    id: "DLV-UPG-PRE-004",
    upgradePlanRef: "DLV-UPG-004",
    checkKind: "compatibility",
    passCondition: "DLV-VPX-005 compatible === true",
    required: true,
    description: "Staging compatibility pre-check",
  },
  {
    id: "DLV-UPG-PRE-005",
    upgradePlanRef: "DLV-UPG-005",
    checkKind: "approval",
    passCondition: "canary approval waived or granted",
    required: false,
    description: "Canary approval pre-check",
  },
  {
    id: "DLV-UPG-PRE-006",
    upgradePlanRef: "DLV-UPG-006",
    checkKind: "catalog",
    passCondition: "governance catalog complete",
    required: true,
    description: "Delivery catalog pre-check",
  },
  {
    id: "DLV-UPG-PRE-007",
    upgradePlanRef: "DLV-UPG-007",
    checkKind: "policy",
    passCondition: "production approval required",
    required: true,
    description: "Production promotion pre-check",
  },
  {
    id: "DLV-UPG-PRE-008",
    upgradePlanRef: "DLV-UPG-008",
    checkKind: "matrix",
    passCondition: "compatibility matrix complete",
    required: true,
    description: "Channel matrix pre-check",
  },
];

export const POST_CHECK_CATALOG: PostCheck[] = [
  {
    id: "DLV-UPG-PST-001",
    upgradePlanRef: "DLV-UPG-001",
    checkKind: "verify",
    passCondition: "verify:v69-technical-governance exit 0",
    required: true,
    description: "Governance verify post-check",
  },
  {
    id: "DLV-UPG-PST-002",
    upgradePlanRef: "DLV-UPG-002",
    checkKind: "health",
    passCondition: "application health ok",
    required: true,
    description: "Runtime health post-check",
  },
  {
    id: "DLV-UPG-PST-003",
    upgradePlanRef: "DLV-UPG-003",
    checkKind: "contract",
    passCondition: "api contract tests pass",
    required: true,
    description: "API contract post-check",
  },
  {
    id: "DLV-UPG-PST-004",
    upgradePlanRef: "DLV-UPG-004",
    checkKind: "smoke",
    passCondition: "staging smoke tests pass",
    required: true,
    description: "Staging smoke post-check",
  },
  {
    id: "DLV-UPG-PST-005",
    upgradePlanRef: "DLV-UPG-005",
    checkKind: "metrics",
    passCondition: "canary SLO within bounds",
    required: true,
    description: "Canary metrics post-check",
  },
  {
    id: "DLV-UPG-PST-006",
    upgradePlanRef: "DLV-UPG-006",
    checkKind: "catalog",
    passCondition: "release catalog ready",
    required: true,
    description: "Delivery catalog post-check",
  },
  {
    id: "DLV-UPG-PST-007",
    upgradePlanRef: "DLV-UPG-007",
    checkKind: "production",
    passCondition: "production verify pass",
    required: true,
    description: "Production promotion post-check",
  },
  {
    id: "DLV-UPG-PST-008",
    upgradePlanRef: "DLV-UPG-008",
    checkKind: "channel",
    passCondition: "channel gate pass",
    required: true,
    description: "Channel promotion post-check",
  },
];

export const ROLLBACK_PLAN_CATALOG: RollbackPlan[] = [
  {
    id: "DLV-UPG-RBK-001",
    upgradePlanRef: "DLV-UPG-001",
    rollbackTarget: "v68-platform-freeze-1",
    triggerCondition: "governance verify failure",
    required: true,
    description: "Revert to platform governance baseline",
  },
  {
    id: "DLV-UPG-RBK-002",
    upgradePlanRef: "DLV-UPG-002",
    rollbackTarget: "DLV-REL-003-prev",
    triggerCondition: "runtime health failure",
    required: true,
    description: "Revert application runtime",
  },
  {
    id: "DLV-UPG-RBK-003",
    upgradePlanRef: "DLV-UPG-003",
    rollbackTarget: "DLV-REL-004-prev",
    triggerCondition: "api contract failure",
    required: true,
    description: "Revert API surface",
  },
  {
    id: "DLV-UPG-RBK-004",
    upgradePlanRef: "DLV-UPG-004",
    rollbackTarget: "DLV-REL-003",
    triggerCondition: "staging smoke failure",
    required: true,
    description: "Revert staging candidate",
  },
  {
    id: "DLV-UPG-RBK-005",
    upgradePlanRef: "DLV-UPG-005",
    rollbackTarget: "DLV-REL-006",
    triggerCondition: "canary SLO breach",
    required: true,
    description: "Revert canary probe",
  },
  {
    id: "DLV-UPG-RBK-006",
    upgradePlanRef: "DLV-UPG-006",
    rollbackTarget: "v70-release-catalog-1",
    triggerCondition: "delivery catalog incomplete",
    required: true,
    description: "Revert delivery foundation",
  },
  {
    id: "DLV-UPG-RBK-007",
    upgradePlanRef: "DLV-UPG-007",
    rollbackTarget: "DLV-REL-006",
    triggerCondition: "production promotion failure",
    required: true,
    description: "Revert production promotion",
  },
  {
    id: "DLV-UPG-RBK-008",
    upgradePlanRef: "DLV-UPG-008",
    rollbackTarget: "beta",
    triggerCondition: "channel gate failure",
    required: true,
    description: "Revert channel promotion",
  },
];

export function isUpgradeGovernanceRefsAligned(): boolean {
  const releaseIds = new Set(RELEASE_CATALOG.map((r) => r.id));
  const pathIds = new Set(UPGRADE_PATH_CATALOG.map((p) => p.id));
  const planIds = new Set(UPGRADE_PLAN_CATALOG.map((p) => p.id));
  const pairIds = new Set(VERSION_PAIR_CATALOG.map((p) => p.id));
  const preIds = new Set(PRE_CHECK_CATALOG.map((c) => c.id));
  const postIds = new Set(POST_CHECK_CATALOG.map((c) => c.id));
  const rbkIds = new Set(ROLLBACK_PLAN_CATALOG.map((r) => r.id));

  const pathsAligned = UPGRADE_PATH_CATALOG.every(
    (p) => releaseIds.has(p.fromReleaseRef) && releaseIds.has(p.toReleaseRef),
  );

  const plansAligned = UPGRADE_PLAN_CATALOG.every(
    (p) =>
      releaseIds.has(p.releaseRef) &&
      pathIds.has(p.upgradePath) &&
      pairIds.has(p.compatibilityCheck) &&
      preIds.has(p.preCheck) &&
      postIds.has(p.postCheck) &&
      rbkIds.has(p.rollbackPlan),
  );

  const checksAligned =
    PRE_CHECK_CATALOG.every((c) => planIds.has(c.upgradePlanRef)) &&
    POST_CHECK_CATALOG.every((c) => planIds.has(c.upgradePlanRef)) &&
    ROLLBACK_PLAN_CATALOG.every((r) => planIds.has(r.upgradePlanRef));

  const coverageComplete =
    UPGRADE_PLAN_CATALOG.every((p) =>
      PRE_CHECK_CATALOG.some((c) => c.upgradePlanRef === p.id),
    ) &&
    UPGRADE_PLAN_CATALOG.every((p) =>
      POST_CHECK_CATALOG.some((c) => c.upgradePlanRef === p.id),
    ) &&
    UPGRADE_PLAN_CATALOG.every((p) =>
      ROLLBACK_PLAN_CATALOG.some((r) => r.upgradePlanRef === p.id),
    );

  return pathsAligned && plansAligned && checksAligned && coverageComplete;
}

export function buildUpgradePathManifest(): UpgradePathManifest {
  const paths = UPGRADE_PATH_CATALOG;
  const catalogComplete = paths.length >= 6;

  return {
    version: V70_UPGRADE_GOVERNANCE_VERSION,
    entryCount: paths.length,
    catalogComplete,
    paths,
    summary: [
      `upgrade-paths count=${paths.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildUpgradePlanManifest(): UpgradePlanManifest {
  const plans = UPGRADE_PLAN_CATALOG;
  const riskLevels = new Set(plans.map((p) => p.riskLevel));
  const catalogComplete = plans.length >= 6 && riskLevels.size >= 3;

  return {
    version: V70_UPGRADE_GOVERNANCE_VERSION,
    planCount: plans.length,
    riskLevelCount: riskLevels.size,
    catalogComplete,
    plans,
    summary: [
      `upgrade-plans count=${plans.length}`,
      `riskLevels=${riskLevels.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPreCheckManifest(): PreCheckManifest {
  const checks = PRE_CHECK_CATALOG;
  const catalogComplete = checks.length >= 6;

  return {
    version: V70_UPGRADE_GOVERNANCE_VERSION,
    entryCount: checks.length,
    catalogComplete,
    checks,
    summary: [
      `pre-checks count=${checks.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildPostCheckManifest(): PostCheckManifest {
  const checks = POST_CHECK_CATALOG;
  const catalogComplete = checks.length >= 6;

  return {
    version: V70_UPGRADE_GOVERNANCE_VERSION,
    entryCount: checks.length,
    catalogComplete,
    checks,
    summary: [
      `post-checks count=${checks.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function buildRollbackPlanManifest(): RollbackPlanManifest {
  const plans = ROLLBACK_PLAN_CATALOG;
  const catalogComplete = plans.length >= 6;

  return {
    version: V70_UPGRADE_GOVERNANCE_VERSION,
    entryCount: plans.length,
    catalogComplete,
    plans,
    summary: [
      `rollback-plans count=${plans.length}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}

export function getUpgradePlanById(id: string): UpgradePlan | undefined {
  return UPGRADE_PLAN_CATALOG.find((p) => p.id === id);
}

export function getUpgradePlansByRiskLevel(
  riskLevel: UpgradePlan["riskLevel"],
): UpgradePlan[] {
  return UPGRADE_PLAN_CATALOG.filter((p) => p.riskLevel === riskLevel);
}

export function getUpgradePathById(id: string): UpgradePath | undefined {
  return UPGRADE_PATH_CATALOG.find((p) => p.id === id);
}

export function getPreCheckByPlanRef(upgradePlanRef: string): PreCheck | undefined {
  return PRE_CHECK_CATALOG.find((c) => c.upgradePlanRef === upgradePlanRef);
}

export function getPostCheckByPlanRef(upgradePlanRef: string): PostCheck | undefined {
  return POST_CHECK_CATALOG.find((c) => c.upgradePlanRef === upgradePlanRef);
}

export function getRollbackPlanByPlanRef(
  upgradePlanRef: string,
): RollbackPlan | undefined {
  return ROLLBACK_PLAN_CATALOG.find((r) => r.upgradePlanRef === upgradePlanRef);
}

export function computeDeclarativeUpgradeRiskBlock(input: {
  riskLevel: UpgradePlan["riskLevel"];
  approval: UpgradePlan["approval"];
}): boolean {
  return (
    (input.riskLevel === "critical" || input.riskLevel === "high") &&
    input.approval === "required"
  );
}
