/**
 * EP-1 / WP-26 — Closure & Freeze Manifest
 * Freezes WP-1~WP-25. Baseline: v80-pilot-ga-1.0.0.
 * Documentation / certification only — no new business capability.
 */

import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import path from "node:path";

import { PILOT_GA_VERSION } from "@/lib/pilot/v80/intake/ga-release.schema";

export const EP_WP26_ID = "WP-26" as const;
export const EP_1_FREEZE_VERSION = "ep-1-freeze-1.0.0" as const;
export const EP_1_CODENAME = "Enterprise Organization Registry Freeze" as const;
export const EP_1_FREEZE_DATE = "2026-08-07" as const;
/** Frozen Pilot GA baseline — EP-1 reuses this only. */
export const EP_1_BASELINE = PILOT_GA_VERSION;

export type Ep1WorkPackageStatus = "frozen";

export type Ep1WorkPackageEntry = Readonly<{
  id: string;
  name: string;
  capability: string;
  modulePath: string;
  verifyScript: string;
  buildApi: string;
  getApi: string;
  deriveFrom: readonly string[];
  status: Ep1WorkPackageStatus;
}>;

export type Ep1Manifest = Readonly<{
  version: typeof EP_1_FREEZE_VERSION;
  codename: typeof EP_1_CODENAME;
  freezeDate: typeof EP_1_FREEZE_DATE;
  baseline: typeof EP_1_BASELINE;
  generatedAt: string;
  fingerprint: string;
  scope: {
    workPackages: "WP-1~WP-25";
    closure: "WP-26";
    noNewBusinessCapability: true;
    projectQuoteTenderModelsUnchanged: true;
    additiveOnly: true;
    readOnlyRegistries: true;
  };
  workPackages: readonly Ep1WorkPackageEntry[];
  dependencyChain: readonly string[];
  certification: "certified" | "blocked";
}>;

/**
 * Frozen catalog of EP-1 work packages (WP-1~WP-25).
 * Order matches dependency chain.
 */
export const EP_1_WORK_PACKAGES: readonly Ep1WorkPackageEntry[] = [
  {
    id: "WP-1",
    name: "Organization Registry",
    capability: "OrganizationRegistry",
    modulePath: "lib/enterprise/organization-registry.ts",
    verifyScript: "scripts/verify-ep-wp1.ts",
    buildApi: "buildOrganizationRegistry",
    getApi: "getOrganizationRegistry",
    deriveFrom: [],
    status: "frozen",
  },
  {
    id: "WP-2",
    name: "Department Registry",
    capability: "DepartmentRegistry",
    modulePath: "lib/enterprise/department-registry.ts",
    verifyScript: "scripts/verify-ep-wp2.ts",
    buildApi: "buildDepartmentRegistry",
    getApi: "getDepartmentRegistry",
    deriveFrom: ["WP-1"],
    status: "frozen",
  },
  {
    id: "WP-3",
    name: "Team Registry",
    capability: "TeamRegistry",
    modulePath: "lib/enterprise/team-registry.ts",
    verifyScript: "scripts/verify-ep-wp3.ts",
    buildApi: "buildTeamRegistry",
    getApi: "getTeamRegistry",
    deriveFrom: ["WP-1", "WP-2"],
    status: "frozen",
  },
  {
    id: "WP-4",
    name: "User Registry",
    capability: "UserRegistry",
    modulePath: "lib/enterprise/user-registry.ts",
    verifyScript: "scripts/verify-ep-wp4.ts",
    buildApi: "buildUserRegistry",
    getApi: "getUserRegistry",
    deriveFrom: ["WP-1", "WP-2", "WP-3"],
    status: "frozen",
  },
  {
    id: "WP-5",
    name: "Role Registry",
    capability: "RoleRegistry",
    modulePath: "lib/enterprise/role-registry.ts",
    verifyScript: "scripts/verify-ep-wp5.ts",
    buildApi: "buildRoleRegistry",
    getApi: "getRoleRegistry",
    deriveFrom: ["WP-1", "WP-2", "WP-3"],
    status: "frozen",
  },
  {
    id: "WP-6",
    name: "Permission Registry",
    capability: "PermissionRegistry",
    modulePath: "lib/enterprise/permission-registry.ts",
    verifyScript: "scripts/verify-ep-wp6.ts",
    buildApi: "buildPermissionRegistry",
    getApi: "getPermissionRegistry",
    deriveFrom: ["WP-5"],
    status: "frozen",
  },
  {
    id: "WP-7",
    name: "Membership Registry",
    capability: "MembershipRegistry",
    modulePath: "lib/enterprise/membership-registry.ts",
    verifyScript: "scripts/verify-ep-wp7.ts",
    buildApi: "buildMembershipRegistry",
    getApi: "getMembershipRegistry",
    deriveFrom: ["WP-4", "WP-5"],
    status: "frozen",
  },
  {
    id: "WP-8",
    name: "Access Registry",
    capability: "AccessRegistry",
    modulePath: "lib/enterprise/access-registry.ts",
    verifyScript: "scripts/verify-ep-wp8.ts",
    buildApi: "buildAccessRegistry",
    getApi: "getAccessRegistry",
    deriveFrom: ["WP-6", "WP-7"],
    status: "frozen",
  },
  {
    id: "WP-9",
    name: "Policy Registry",
    capability: "PolicyRegistry",
    modulePath: "lib/enterprise/policy-registry.ts",
    verifyScript: "scripts/verify-ep-wp9.ts",
    buildApi: "buildPolicyRegistry",
    getApi: "getPolicyRegistry",
    deriveFrom: ["WP-6"],
    status: "frozen",
  },
  {
    id: "WP-10",
    name: "Assignment Registry",
    capability: "AssignmentRegistry",
    modulePath: "lib/enterprise/assignment-registry.ts",
    verifyScript: "scripts/verify-ep-wp10.ts",
    buildApi: "buildAssignmentRegistry",
    getApi: "getAssignmentRegistry",
    deriveFrom: ["WP-9"],
    status: "frozen",
  },
  {
    id: "WP-11",
    name: "Notification Registry",
    capability: "NotificationRegistry",
    modulePath: "lib/enterprise/notification-registry.ts",
    verifyScript: "scripts/verify-ep-wp11.ts",
    buildApi: "buildNotificationRegistry",
    getApi: "getNotificationRegistry",
    deriveFrom: ["WP-10"],
    status: "frozen",
  },
  {
    id: "WP-12",
    name: "Alert Registry",
    capability: "AlertRegistry",
    modulePath: "lib/enterprise/alert-registry.ts",
    verifyScript: "scripts/verify-ep-wp12.ts",
    buildApi: "buildAlertRegistry",
    getApi: "getAlertRegistry",
    deriveFrom: ["WP-11"],
    status: "frozen",
  },
  {
    id: "WP-13",
    name: "Escalation Registry",
    capability: "EscalationRegistry",
    modulePath: "lib/enterprise/escalation-registry.ts",
    verifyScript: "scripts/verify-ep-wp13.ts",
    buildApi: "buildEscalationRegistry",
    getApi: "getEscalationRegistry",
    deriveFrom: ["WP-12"],
    status: "frozen",
  },
  {
    id: "WP-14",
    name: "Workflow Registry",
    capability: "WorkflowRegistry",
    modulePath: "lib/enterprise/workflow-registry.ts",
    verifyScript: "scripts/verify-ep-wp14.ts",
    buildApi: "buildWorkflowRegistry",
    getApi: "getWorkflowRegistry",
    deriveFrom: ["WP-13"],
    status: "frozen",
  },
  {
    id: "WP-15",
    name: "Approval Registry",
    capability: "ApprovalRegistry",
    modulePath: "lib/enterprise/approval-registry.ts",
    verifyScript: "scripts/verify-ep-wp15.ts",
    buildApi: "buildApprovalRegistry",
    getApi: "getApprovalRegistry",
    deriveFrom: ["WP-14"],
    status: "frozen",
  },
  {
    id: "WP-16",
    name: "Review Registry",
    capability: "ReviewRegistry",
    modulePath: "lib/enterprise/review-registry.ts",
    verifyScript: "scripts/verify-ep-wp16.ts",
    buildApi: "buildReviewRegistry",
    getApi: "getReviewRegistry",
    deriveFrom: ["WP-15"],
    status: "frozen",
  },
  {
    id: "WP-17",
    name: "Audit Registry",
    capability: "AuditRegistry",
    modulePath: "lib/enterprise/audit-registry.ts",
    verifyScript: "scripts/verify-ep-wp17.ts",
    buildApi: "buildAuditRegistry",
    getApi: "getAuditRegistry",
    deriveFrom: ["WP-16"],
    status: "frozen",
  },
  {
    id: "WP-18",
    name: "Compliance Registry",
    capability: "ComplianceRegistry",
    modulePath: "lib/enterprise/compliance-registry.ts",
    verifyScript: "scripts/verify-ep-wp18.ts",
    buildApi: "buildComplianceRegistry",
    getApi: "getComplianceRegistry",
    deriveFrom: ["WP-17"],
    status: "frozen",
  },
  {
    id: "WP-19",
    name: "Control Registry",
    capability: "ControlRegistry",
    modulePath: "lib/enterprise/control-registry.ts",
    verifyScript: "scripts/verify-ep-wp19.ts",
    buildApi: "buildControlRegistry",
    getApi: "getControlRegistry",
    deriveFrom: ["WP-18"],
    status: "frozen",
  },
  {
    id: "WP-20",
    name: "Risk Registry",
    capability: "RiskRegistry",
    modulePath: "lib/enterprise/risk-registry.ts",
    verifyScript: "scripts/verify-ep-wp20.ts",
    buildApi: "buildRiskRegistry",
    getApi: "getRiskRegistry",
    deriveFrom: ["WP-19"],
    status: "frozen",
  },
  {
    id: "WP-21",
    name: "Issue Registry",
    capability: "IssueRegistry",
    modulePath: "lib/enterprise/issue-registry.ts",
    verifyScript: "scripts/verify-ep-wp21.ts",
    buildApi: "buildIssueRegistry",
    getApi: "getIssueRegistry",
    deriveFrom: ["WP-20"],
    status: "frozen",
  },
  {
    id: "WP-22",
    name: "Resolution Registry",
    capability: "ResolutionRegistry",
    modulePath: "lib/enterprise/resolution-registry.ts",
    verifyScript: "scripts/verify-ep-wp22.ts",
    buildApi: "buildResolutionRegistry",
    getApi: "getResolutionRegistry",
    deriveFrom: ["WP-21"],
    status: "frozen",
  },
  {
    id: "WP-23",
    name: "Remedy Registry",
    capability: "RemedyRegistry",
    modulePath: "lib/enterprise/remedy-registry.ts",
    verifyScript: "scripts/verify-ep-wp23.ts",
    buildApi: "buildRemedyRegistry",
    getApi: "getRemedyRegistry",
    deriveFrom: ["WP-22"],
    status: "frozen",
  },
  {
    id: "WP-24",
    name: "Recovery Registry",
    capability: "RecoveryRegistry",
    modulePath: "lib/enterprise/recovery-registry.ts",
    verifyScript: "scripts/verify-ep-wp24.ts",
    buildApi: "buildRecoveryRegistry",
    getApi: "getRecoveryRegistry",
    deriveFrom: ["WP-23"],
    status: "frozen",
  },
  {
    id: "WP-25",
    name: "Restore Registry",
    capability: "RestoreRegistry",
    modulePath: "lib/enterprise/restore-registry.ts",
    verifyScript: "scripts/verify-ep-wp25.ts",
    buildApi: "buildRestoreRegistry",
    getApi: "getRestoreRegistry",
    deriveFrom: ["WP-24"],
    status: "frozen",
  },
] as const;

export const EP_1_DEPENDENCY_CHAIN: readonly string[] =
  EP_1_WORK_PACKAGES.map((wp) => wp.id);

export const EP_1_CORE_MODELS_UNCHANGED = [
  "Project",
  "Quote",
  "Tender",
] as const;

function stableCatalogPayload(): string {
  return JSON.stringify({
    version: EP_1_FREEZE_VERSION,
    codename: EP_1_CODENAME,
    freezeDate: EP_1_FREEZE_DATE,
    baseline: EP_1_BASELINE,
    workPackages: EP_1_WORK_PACKAGES,
    dependencyChain: EP_1_DEPENDENCY_CHAIN,
    coreModelsUnchanged: EP_1_CORE_MODELS_UNCHANGED,
  });
}

/** Deterministic fingerprint of the frozen EP-1 catalog (excludes generatedAt). */
export function computeEp1Fingerprint(): string {
  return createHash("sha256").update(stableCatalogPayload()).digest("hex");
}

export function listEp1ArtifactPresence(cwd = process.cwd()): Array<{
  path: string;
  present: boolean;
}> {
  const paths = [
    ...EP_1_WORK_PACKAGES.flatMap((wp) => [wp.modulePath, wp.verifyScript]),
    "lib/enterprise/index.ts",
    "lib/enterprise/ep1-manifest.ts",
    "scripts/verify-ep1.ts",
  ];
  return paths.map((p) => ({
    path: p,
    present: existsSync(path.join(cwd, p)),
  }));
}

export function validateEp1DependencyChain(): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const known = new Set(EP_1_WORK_PACKAGES.map((wp) => wp.id));

  if (EP_1_WORK_PACKAGES.length !== 25) {
    errors.push(`expected 25 work packages, got ${EP_1_WORK_PACKAGES.length}`);
  }

  for (let i = 0; i < EP_1_WORK_PACKAGES.length; i++) {
    const wp = EP_1_WORK_PACKAGES[i]!;
    const expectedId = `WP-${i + 1}`;
    if (wp.id !== expectedId) {
      errors.push(`index ${i}: expected ${expectedId}, got ${wp.id}`);
    }
    for (const dep of wp.deriveFrom) {
      if (!known.has(dep)) {
        errors.push(`${wp.id} derives from unknown ${dep}`);
      }
      const depIndex = EP_1_WORK_PACKAGES.findIndex((x) => x.id === dep);
      if (depIndex < 0 || depIndex >= i) {
        errors.push(`${wp.id} must derive from earlier WP, got ${dep}`);
      }
    }
  }

  for (let i = 0; i < EP_1_DEPENDENCY_CHAIN.length; i++) {
    if (EP_1_DEPENDENCY_CHAIN[i] !== EP_1_WORK_PACKAGES[i]?.id) {
      errors.push(`dependency chain mismatch at ${i}`);
    }
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Build the EP-1 freeze manifest (read-only certification snapshot).
 */
export function buildEp1Manifest(): Ep1Manifest {
  const artifacts = listEp1ArtifactPresence();
  const chain = validateEp1DependencyChain();
  const allPresent = artifacts.every((a) => a.present);
  const fingerprint = computeEp1Fingerprint();

  return {
    version: EP_1_FREEZE_VERSION,
    codename: EP_1_CODENAME,
    freezeDate: EP_1_FREEZE_DATE,
    baseline: EP_1_BASELINE,
    generatedAt: new Date().toISOString(),
    fingerprint,
    scope: {
      workPackages: "WP-1~WP-25",
      closure: "WP-26",
      noNewBusinessCapability: true,
      projectQuoteTenderModelsUnchanged: true,
      additiveOnly: true,
      readOnlyRegistries: true,
    },
    workPackages: EP_1_WORK_PACKAGES,
    dependencyChain: EP_1_DEPENDENCY_CHAIN,
    certification: allPresent && chain.ok ? "certified" : "blocked",
  };
}
