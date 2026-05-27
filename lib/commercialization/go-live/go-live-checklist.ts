/**
 * V3.7-H20 Production Go-Live — static checklist (no runtime)
 */

import { buildProductionRolloutFoundation } from "../rollout/index";
import { buildEnterpriseRolloutFoundation } from "../deployment-readiness/index";

export const GO_LIVE_CHECKLIST_VERSION = "3.7-h20-checklist-1" as const;

export type GoLiveCheckStatus = "complete" | "pending" | "optional";
export type GoLiveCheckCategory = "required" | "optional" | "approval" | "rollback";

export type GoLiveChecklistItem = {
  id: string;
  label: string;
  group: string;
  category: GoLiveCheckCategory;
  status: GoLiveCheckStatus;
  href?: string;
  apiHref?: string;
  description: string;
};

export type GoLiveChecklistGroup = {
  id: string;
  label: string;
  itemIds: string[];
};

export type GoLiveChecklistConfig = {
  version: typeof GO_LIVE_CHECKLIST_VERSION;
  checklistId: string;
  checklistItems: GoLiveChecklistItem[];
  checklistGroups: GoLiveChecklistGroup[];
  requiredChecks: GoLiveChecklistItem[];
  optionalChecks: GoLiveChecklistItem[];
  approvalChecks: GoLiveChecklistItem[];
  rollbackChecks: GoLiveChecklistItem[];
  summary: string;
};

function item(
  id: string,
  label: string,
  group: string,
  category: GoLiveCheckCategory,
  status: GoLiveCheckStatus,
  description: string,
  href?: string,
  apiHref?: string,
): GoLiveChecklistItem {
  return { id, label, group, category, status, description, href, apiHref };
}

export function buildGoLiveChecklistConfig(input?: {
  deploymentId?: string;
}): GoLiveChecklistConfig {
  const deploymentId = input?.deploymentId ?? "go-live-checklist";
  const checklistId = `GCL-V37H20-${deploymentId.slice(0, 8)}`;

  const rollout = buildProductionRolloutFoundation({ deploymentId });
  const readiness = buildEnterpriseRolloutFoundation({ deploymentId });
  const launch = rollout.launch;
  const handoff = rollout.handoff;
  const complete = (ready: boolean): GoLiveCheckStatus => (ready ? "complete" : "pending");

  const checklistItems: GoLiveChecklistItem[] = [
    item("gl-launch-ready", "Launch checklist complete", "go-live", "required", complete(handoff.readyForLaunch), "All required launch checklist items verified.", "/dashboard/rollout", "/api/commercialization/rollout"),
    item("gl-rollout-readiness", "Rollout readiness verified", "go-live", "required", complete(readiness.manifest.readyForRollout), "Enterprise rollout readiness checks pass.", "/dashboard/rollout-readiness", "/api/commercialization/rollout-readiness"),
    item("gl-enterprise-landing", "Enterprise landing ready", "onboarding", "required", complete(launch.onboardingReady), "Enterprise landing and quick actions configured.", "/dashboard/enterprise-landing", "/api/commercialization/enterprise-landing"),
    item("gl-command-center", "Command center operational", "ops", "required", complete(launch.rolloutReady), "Unified command center for go-live control.", "/dashboard/command-center", "/api/commercialization/command-center"),
    item("gl-ops-portal", "Ops portal handoff", "ops", "required", complete(launch.opsReady), "Enterprise ops portal ready for production.", "/dashboard/ops", "/api/commercialization/ops-overview"),
    item("gl-release-ledger", "Release ledger finalized", "release", "required", complete(launch.releaseReady), "Production release ledger review complete.", "/dashboard/release-ledger", "/api/commercialization/release-ledger"),
    item("gl-governance-approval", "Governance approval gate", "approval", "approval", complete(launch.governanceReady), "Governance review and access governance approved.", "/dashboard/governance-review", "/api/commercialization/governance"),
    item("gl-audit-approval", "Audit approval gate", "approval", "approval", complete(launch.governanceReady), "Audit snapshot and trace review approved.", "/dashboard/audit-review", "/api/commercialization/audit"),
    item("gl-access-approval", "Access control approval", "approval", "approval", complete(launch.governanceReady), "Access matrix and policy review approved.", "/dashboard/access-control", "/api/commercialization/access-control"),
    item("gl-freeze-intact", "Launch freeze intact", "freeze", "required", complete(launch.deploymentReady), "Build freeze and hardening baseline intact."),
    item("gl-rollback-plan", "Rollback awareness documented", "rollback", "rollback", complete(launch.deploymentReady), "Rollback paths via release ledger and evidence export.", "/dashboard/evidence-export", "/api/commercialization/evidence-export"),
    item("gl-rollback-readiness", "Rollback readiness verified", "rollback", "rollback", complete(readiness.summary.deploymentReady), "Deployment baseline supports rollback awareness.", "/dashboard/rollout-readiness"),
    item("gl-evidence-export", "Evidence bundle available", "release", "optional", complete(launch.releaseReady), "Static evidence export for launch audit.", "/dashboard/evidence-export", "/api/commercialization/evidence-export"),
    item("gl-policy-review", "Policy review documentation", "approval", "optional", "optional", "Effective access policy explanations for handoff.", "/dashboard/policy-review", "/api/commercialization/policy-review"),
    item("gl-permission-lineage", "Permission lineage documented", "approval", "optional", "optional", "Role and permission lineage for governance handoff.", "/dashboard/permission-lineage", "/api/commercialization/permission-lineage"),
  ];

  const checklistGroups: GoLiveChecklistGroup[] = [
    { id: "go-live", label: "Go-Live Control", itemIds: ["gl-launch-ready", "gl-rollout-readiness", "gl-freeze-intact"] },
    { id: "onboarding", label: "Enterprise Onboarding", itemIds: ["gl-enterprise-landing"] },
    { id: "ops", label: "Operational Handoff", itemIds: ["gl-command-center", "gl-ops-portal"] },
    { id: "approval", label: "Approval Gates", itemIds: ["gl-governance-approval", "gl-audit-approval", "gl-access-approval", "gl-policy-review", "gl-permission-lineage"] },
    { id: "release", label: "Release Finalization", itemIds: ["gl-release-ledger", "gl-evidence-export"] },
    { id: "rollback", label: "Rollback Awareness", itemIds: ["gl-rollback-plan", "gl-rollback-readiness"] },
  ];

  const requiredChecks = checklistItems.filter((c) => c.category === "required");
  const optionalChecks = checklistItems.filter((c) => c.category === "optional");
  const approvalChecks = checklistItems.filter((c) => c.category === "approval");
  const rollbackChecks = checklistItems.filter((c) => c.category === "rollback");

  const passed = checklistItems.filter((c) => c.status === "complete").length;

  return {
    version: GO_LIVE_CHECKLIST_VERSION,
    checklistId,
    checklistItems,
    checklistGroups,
    requiredChecks,
    optionalChecks,
    approvalChecks,
    rollbackChecks,
    summary: `go-live-checklist id=${checklistId} items=${checklistItems.length} required=${requiredChecks.length} approval=${approvalChecks.length} rollback=${rollbackChecks.length} complete=${passed}`,
  };
}
