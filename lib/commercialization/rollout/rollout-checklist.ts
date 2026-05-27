/**
 * V3.7-H19 Production Rollout — static launch checklist (no runtime)
 */

import { buildEnterpriseRolloutFoundation } from "../deployment-readiness/index";
import { getLandingCardsConfig } from "../landing/landing-cards";

export const ROLLOUT_CHECKLIST_VERSION = "3.7-h19-checklist-1" as const;

export type ChecklistStatus = "complete" | "pending" | "optional";
export type ChecklistOwner = "ops" | "governance" | "release" | "audit" | "access" | "platform";

export type RolloutChecklistItem = {
  id: string;
  label: string;
  group: string;
  owner: ChecklistOwner;
  status: ChecklistStatus;
  required: boolean;
  href?: string;
  apiHref?: string;
  description: string;
};

export type RolloutChecklistGroup = {
  id: string;
  label: string;
  itemIds: string[];
};

export type RolloutChecklistConfig = {
  version: typeof ROLLOUT_CHECKLIST_VERSION;
  checklistId: string;
  checklistItems: RolloutChecklistItem[];
  checklistGroups: RolloutChecklistGroup[];
  owners: ChecklistOwner[];
  statuses: ChecklistStatus[];
  requiredChecks: RolloutChecklistItem[];
  optionalChecks: RolloutChecklistItem[];
  summary: string;
};

function item(
  id: string,
  label: string,
  group: string,
  owner: ChecklistOwner,
  status: ChecklistStatus,
  required: boolean,
  description: string,
  href?: string,
  apiHref?: string,
): RolloutChecklistItem {
  return { id, label, group, owner, status, required, description, href, apiHref };
}

export function buildRolloutChecklistConfig(input?: {
  deploymentId?: string;
}): RolloutChecklistConfig {
  const deploymentId = input?.deploymentId ?? "rollout-checklist";
  const checklistId = `RCL-V37H19-${deploymentId.slice(0, 8)}`;

  const rollout = buildEnterpriseRolloutFoundation({ deploymentId });
  const landing = getLandingCardsConfig();
  const s = rollout.summary;
  const complete = (ready: boolean): ChecklistStatus => (ready ? "complete" : "pending");

  const checklistItems: RolloutChecklistItem[] = [
    item("chk-build", "Build & type stability verified", "deployment", "platform", complete(s.deploymentReady), true, "Production build and TypeScript checks pass.", undefined, undefined),
    item("chk-freeze", "Runtime freeze intact", "deployment", "platform", complete(s.deploymentReady), true, "Build freeze manifest signals intact."),
    item("chk-landing", "Enterprise landing configured", "onboarding", "ops", complete(s.onboardingReady), true, "Enterprise landing cards and quick actions available.", "/dashboard/enterprise-landing", "/api/commercialization/enterprise-landing"),
    item("chk-command-center", "Command center operational", "ops", "ops", complete(s.rolloutReady), true, "Unified command center entry and modules.", "/dashboard/command-center", "/api/commercialization/command-center"),
    item("chk-ops-portal", "Ops portal handoff", "ops", "ops", complete(s.operationalReady), true, "Enterprise ops portal and navigation.", "/dashboard/ops", "/api/commercialization/ops-overview"),
    item("chk-governance", "Governance approval surface", "governance", "governance", complete(s.governanceReady), true, "Governance review and permission lineage.", "/dashboard/governance-review", "/api/commercialization/governance"),
    item("chk-access", "Access control review", "access", "access", complete(s.governanceReady), true, "Access matrix and policy review.", "/dashboard/access-control", "/api/commercialization/access-control"),
    item("chk-audit", "Audit review complete", "audit", "audit", complete(s.governanceReady), true, "Audit snapshot and trace review.", "/dashboard/audit-review", "/api/commercialization/audit"),
    item("chk-release", "Release ledger ready", "release", "release", complete(s.releaseReady), true, "Production release ledger surface.", "/dashboard/release-ledger", "/api/commercialization/release-ledger"),
    item("chk-evidence", "Evidence export available", "release", "release", complete(s.releaseReady), true, "Static evidence export for release governance.", "/dashboard/evidence-export", "/api/commercialization/evidence-export"),
    item("chk-rollout-readiness", "Rollout readiness verified", "deployment", "platform", complete(s.rolloutReady), true, "Enterprise rollout readiness checks pass.", "/dashboard/rollout-readiness", "/api/commercialization/rollout-readiness"),
    item("chk-observability", "Observability ops surface", "ops", "ops", complete(s.operationalReady), false, "Commercial observability operations.", "/commercial/v37/operations"),
    item("chk-dashboard", "Enterprise dashboard integration", "onboarding", "ops", complete(s.onboardingReady), false, "Unified enterprise dashboard widgets.", "/dashboard/enterprise", "/api/commercialization/dashboard-overview"),
    item("chk-policy", "Policy review documentation", "governance", "governance", "optional", false, "Effective access policy explanations.", "/dashboard/policy-review", "/api/commercialization/policy-review"),
    item("chk-lineage", "Permission lineage documentation", "governance", "governance", "optional", false, "Role and permission lineage for handoff.", "/dashboard/permission-lineage", "/api/commercialization/permission-lineage"),
  ];

  const checklistGroups: RolloutChecklistGroup[] = [
    { id: "deployment", label: "Deployment Guide", itemIds: ["chk-build", "chk-freeze", "chk-rollout-readiness"] },
    { id: "onboarding", label: "Enterprise Onboarding", itemIds: ["chk-landing", "chk-dashboard"] },
    { id: "ops", label: "Operational Handoff", itemIds: ["chk-command-center", "chk-ops-portal", "chk-observability"] },
    { id: "governance", label: "Governance Approval", itemIds: ["chk-governance", "chk-access", "chk-policy", "chk-lineage"] },
    { id: "audit", label: "Audit Review", itemIds: ["chk-audit"] },
    { id: "release", label: "Release Launch", itemIds: ["chk-release", "chk-evidence"] },
  ];

  const owners: ChecklistOwner[] = ["ops", "governance", "release", "audit", "access", "platform"];
  const statuses: ChecklistStatus[] = ["complete", "pending", "optional"];
  const requiredChecks = checklistItems.filter((c) => c.required);
  const optionalChecks = checklistItems.filter((c) => !c.required);

  const passed = checklistItems.filter((c) => c.status === "complete").length;

  return {
    version: ROLLOUT_CHECKLIST_VERSION,
    checklistId,
    checklistItems,
    checklistGroups,
    owners,
    statuses,
    requiredChecks,
    optionalChecks,
    summary: `rollout-checklist id=${checklistId} items=${checklistItems.length} required=${requiredChecks.length} complete=${passed} landingCards=${landing.cards.length}`,
  };
}
