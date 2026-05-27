/**
 * V3.7-H21 Enterprise Launch Closure — static checklist (no runtime)
 */

import { buildProductionGoLiveFoundation } from "../go-live/index";
import { buildProductionRolloutFoundation } from "../rollout/index";
import { buildEnterpriseRolloutFoundation } from "../deployment-readiness/index";
import { buildEnterpriseLandingFoundation } from "../landing/index";

export const LAUNCH_CLOSURE_CHECKLIST_VERSION = "3.7-h21-closure-checklist-1" as const;

export type ClosureStatus = "complete" | "pending";
export type ClosureGroup = "rollout" | "governance" | "ops" | "audit" | "release" | "closure";

export type LaunchClosureItem = {
  id: string;
  label: string;
  group: ClosureGroup;
  status: ClosureStatus;
  required: boolean;
  href?: string;
  apiHref?: string;
  description: string;
};

export type CompletionGroup = {
  id: string;
  label: string;
  itemIds: string[];
};

export type LaunchClosureChecklist = {
  version: typeof LAUNCH_CLOSURE_CHECKLIST_VERSION;
  checklistId: string;
  closureItems: LaunchClosureItem[];
  completionGroups: CompletionGroup[];
  requiredCompletions: LaunchClosureItem[];
  governanceCompletions: LaunchClosureItem[];
  opsCompletions: LaunchClosureItem[];
  rolloutCompletions: LaunchClosureItem[];
  summary: string;
};

function item(
  id: string,
  label: string,
  group: ClosureGroup,
  status: ClosureStatus,
  required: boolean,
  description: string,
  href?: string,
  apiHref?: string,
): LaunchClosureItem {
  return { id, label, group, status, required, description, href, apiHref };
}

export function buildLaunchClosureChecklist(input?: {
  deploymentId?: string;
}): LaunchClosureChecklist {
  const deploymentId = input?.deploymentId ?? "launch-closure-checklist";
  const checklistId = `LCC-V37H21-${deploymentId.slice(0, 8)}`;

  const goLive = buildProductionGoLiveFoundation({ deploymentId });
  const rollout = buildProductionRolloutFoundation({ deploymentId });
  const readiness = buildEnterpriseRolloutFoundation({ deploymentId });
  const landing = buildEnterpriseLandingFoundation({ deploymentId });

  const complete = (ready: boolean): ClosureStatus => (ready ? "complete" : "pending");

  const closureItems: LaunchClosureItem[] = [
    item("lc-go-live", "Go-live control finalized", "closure", complete(goLive.manifest.readyForGoLive), true, "Production go-live control and launch freeze complete.", "/dashboard/go-live", "/api/commercialization/go-live"),
    item("lc-launch-checklist", "Launch checklist finalized", "closure", complete(rollout.handoff.readyForLaunch), true, "Production rollout launch checklist complete.", "/dashboard/rollout", "/api/commercialization/rollout"),
    item("lc-rollout-readiness", "Rollout readiness closed", "rollout", complete(readiness.manifest.readyForRollout), true, "Enterprise rollout readiness verified.", "/dashboard/rollout-readiness", "/api/commercialization/rollout-readiness"),
    item("lc-enterprise-landing", "Enterprise landing closed", "rollout", complete(landing.manifest.readyForEnterprise), true, "Enterprise landing and SaaS readiness complete.", "/dashboard/enterprise-landing", "/api/commercialization/enterprise-landing"),
    item("lc-command-center", "Command center operational closure", "ops", complete(rollout.launch.rolloutReady), true, "Unified command center ready for enterprise operations.", "/dashboard/command-center", "/api/commercialization/command-center"),
    item("lc-ops-portal", "Ops portal completion", "ops", complete(rollout.launch.opsReady), true, "Enterprise ops portal handoff complete.", "/dashboard/ops", "/api/commercialization/ops-overview"),
    item("lc-governance", "Governance review closure", "governance", complete(rollout.launch.governanceReady), true, "Governance review and role catalog closed.", "/dashboard/governance-review", "/api/commercialization/governance"),
    item("lc-access", "Access governance closure", "governance", complete(goLive.freeze.governanceReady), true, "Access matrix and policy review closed.", "/dashboard/access-control", "/api/commercialization/access-control"),
    item("lc-audit", "Audit review closure", "audit", complete(goLive.freeze.approvalsReady), true, "Audit snapshot and trace review closed.", "/dashboard/audit-review", "/api/commercialization/audit"),
    item("lc-release", "Release ledger closure", "release", complete(rollout.launch.releaseReady), true, "Production release ledger finalized.", "/dashboard/release-ledger", "/api/commercialization/release-ledger"),
    item("lc-evidence", "Evidence export closure", "release", complete(rollout.launch.releaseReady), true, "Static evidence export available for archival.", "/dashboard/evidence-export", "/api/commercialization/evidence-export"),
    item("lc-observability", "Observability ops closure", "ops", complete(rollout.launch.opsReady), false, "Commercial observability operations surface.", "/commercial/v37/operations"),
    item("lc-permission-lineage", "Permission lineage documented", "governance", "complete", false, "Role and permission lineage for archival.", "/dashboard/permission-lineage", "/api/commercialization/permission-lineage"),
    item("lc-policy", "Policy review documented", "governance", "complete", false, "Effective access policy for enterprise archive.", "/dashboard/policy-review", "/api/commercialization/policy-review"),
  ];

  const completionGroups: CompletionGroup[] = [
    { id: "closure", label: "Launch Finalization", itemIds: ["lc-go-live", "lc-launch-checklist"] },
    { id: "rollout", label: "Rollout Completion", itemIds: ["lc-rollout-readiness", "lc-enterprise-landing"] },
    { id: "ops", label: "Operational Closure", itemIds: ["lc-command-center", "lc-ops-portal", "lc-observability"] },
    { id: "governance", label: "Governance Closure", itemIds: ["lc-governance", "lc-access", "lc-permission-lineage", "lc-policy"] },
    { id: "audit", label: "Audit Closure", itemIds: ["lc-audit"] },
    { id: "release", label: "Release Completion", itemIds: ["lc-release", "lc-evidence"] },
  ];

  const requiredCompletions = closureItems.filter((c) => c.required);
  const governanceCompletions = closureItems.filter((c) => c.group === "governance");
  const opsCompletions = closureItems.filter((c) => c.group === "ops");
  const rolloutCompletions = closureItems.filter((c) => c.group === "rollout" || c.group === "closure");

  const passed = closureItems.filter((c) => c.status === "complete").length;

  return {
    version: LAUNCH_CLOSURE_CHECKLIST_VERSION,
    checklistId,
    closureItems,
    completionGroups,
    requiredCompletions,
    governanceCompletions,
    opsCompletions,
    rolloutCompletions,
    summary: `launch-closure-checklist id=${checklistId} items=${closureItems.length} required=${requiredCompletions.length} complete=${passed} governance=${governanceCompletions.filter((c) => c.status === "complete").length} ops=${opsCompletions.filter((c) => c.status === "complete").length}`,
  };
}
