/**
 * V3.7-H24 Enterprise Lifecycle — static continuity config (no runtime)
 */

import { buildEnterpriseRetentionFoundation } from "../retention/index";
import { buildEnterpriseArchivalFoundation } from "../archival/index";
import { buildEnterpriseLaunchClosureFoundation } from "../launch-closure/index";
import { buildEnterpriseRolloutFoundation } from "../deployment-readiness/index";
import { buildEnterpriseLandingFoundation } from "../landing/index";
import { buildProductionGoLiveFoundation } from "../go-live/index";

export const LIFECYCLE_CONTINUITY_VERSION = "3.7-h24-continuity-1" as const;

export type LifecycleStage = {
  id: string;
  label: string;
  phase: string;
  ready: boolean;
  href?: string;
  apiHref?: string;
  description: string;
};

export type LifecycleContinuityConfig = {
  version: typeof LIFECYCLE_CONTINUITY_VERSION;
  configId: string;
  lifecycleStages: LifecycleStage[];
  continuityStages: LifecycleStage[];
  governanceStages: LifecycleStage[];
  operationalStages: LifecycleStage[];
  archivalStages: LifecycleStage[];
  preservationStages: LifecycleStage[];
  summary: string;
};

function stage(
  id: string,
  label: string,
  phase: string,
  ready: boolean,
  description: string,
  href?: string,
  apiHref?: string,
): LifecycleStage {
  return { id, label, phase, ready, description, href, apiHref };
}

export function buildLifecycleContinuityConfig(input?: {
  deploymentId?: string;
}): LifecycleContinuityConfig {
  const deploymentId = input?.deploymentId ?? "lifecycle-continuity";
  const configId = `LCC-V37H24-${deploymentId.slice(0, 8)}`;

  const retention = buildEnterpriseRetentionFoundation({ deploymentId });
  const archival = buildEnterpriseArchivalFoundation({ deploymentId });
  const closure = buildEnterpriseLaunchClosureFoundation({ deploymentId });
  const readiness = buildEnterpriseRolloutFoundation({ deploymentId });
  const landing = buildEnterpriseLandingFoundation({ deploymentId });
  const goLive = buildProductionGoLiveFoundation({ deploymentId });

  const lifecycleStages: LifecycleStage[] = [
    stage("ls-landing", "Enterprise Landing", "lifecycle", landing.manifest.readyForEnterprise, "Enterprise landing and SaaS readiness.", "/dashboard/enterprise-landing", "/api/commercialization/enterprise-landing"),
    stage("ls-rollout-readiness", "Rollout Readiness", "lifecycle", readiness.manifest.readyForRollout, "Enterprise rollout readiness verified.", "/dashboard/rollout-readiness", "/api/commercialization/rollout-readiness"),
    stage("ls-rollout", "Launch Checklist", "lifecycle", closure.closure.rolloutCompleted, "Production rollout launch checklist.", "/dashboard/rollout", "/api/commercialization/rollout"),
    stage("ls-go-live", "Go-Live Control", "lifecycle", goLive.manifest.readyForGoLive, "Production go-live control finalized.", "/dashboard/go-live", "/api/commercialization/go-live"),
    stage("ls-closure", "Launch Closure", "lifecycle", closure.manifest.readyForClosure, "Enterprise launch closure complete.", "/dashboard/launch-closure", "/api/commercialization/launch-closure"),
    stage("ls-archival", "Enterprise Archival", "lifecycle", archival.manifest.readyForPreservation, "Production archival and preservation.", "/dashboard/archival", "/api/commercialization/archival"),
    stage("ls-retention", "Retention Review", "lifecycle", retention.manifest.readyForRetention, "Archive access and retention review.", "/dashboard/archive-access", "/api/commercialization/archive-access"),
  ];

  const continuityStages: LifecycleStage[] = [
    stage("cs-production", "Production Continuity", "continuity", goLive.freeze.launchFrozen, "Launch freeze and production baseline continuity."),
    stage("cs-rollout", "Rollout Continuity", "continuity", readiness.manifest.readyForEnterprise, "Rollout readiness operational continuity.", "/dashboard/rollout-readiness"),
    stage("cs-lifecycle", "Lifecycle Continuity", "continuity", retention.manifest.readyForLifecycle, "Full lifecycle continuity gate.", "/dashboard/lifecycle"),
    stage("cs-observability", "Observability Continuity", "continuity", goLive.freeze.opsReady, "Commercial observability operations.", "/commercial/v37/operations"),
  ];

  const governanceStages: LifecycleStage[] = [
    stage("gs-governance", "Governance Review", "governance", closure.closure.governanceCompleted, "Governance review continuity.", "/dashboard/governance-review", "/api/commercialization/governance"),
    stage("gs-audit", "Audit Review", "governance", closure.closure.auditCompleted, "Audit review continuity.", "/dashboard/audit-review", "/api/commercialization/audit"),
    stage("gs-access", "Access Governance", "governance", retention.access.governanceRetentionReady, "Access governance retention continuity.", "/dashboard/access-control", "/api/commercialization/access-control"),
    stage("gs-retention-gov", "Governance Retention", "governance", retention.access.governanceRetentionReady, "Governance retention policy continuity.", "/dashboard/archive-access"),
  ];

  const operationalStages: LifecycleStage[] = [
    stage("os-command-center", "Command Center", "operational", closure.closure.opsCompleted, "Unified command center continuity.", "/dashboard/command-center", "/api/commercialization/command-center"),
    stage("os-ops-portal", "Ops Portal", "operational", retention.access.lifecycleReady, "Enterprise ops portal continuity.", "/dashboard/ops", "/api/commercialization/ops-overview"),
    stage("os-enterprise", "Enterprise Dashboard", "operational", landing.manifest.readyForEnterprise, "Enterprise dashboard integration.", "/dashboard/enterprise", "/api/commercialization/dashboard-overview"),
  ];

  const archivalStages: LifecycleStage[] = archival.checklist.archivalItems.map((item) =>
    stage(
      `as-${item.id}`,
      item.label,
      "archival",
      item.status === "archived",
      item.description,
      item.href,
      item.apiHref,
    ),
  );

  const preservationStages: LifecycleStage[] = [
    ...retention.policies.retentionPolicies.map((p) =>
      stage(`ps-${p.id}`, p.label, "preservation", p.readonly, p.description, p.href, p.apiHref),
    ),
    ...retention.policies.lifecyclePolicies.map((p) =>
      stage(`ps-${p.id}`, p.label, "preservation", p.readonly, p.description, p.href, p.apiHref),
    ),
  ];

  const allStages = [
    ...lifecycleStages,
    ...continuityStages,
    ...governanceStages,
    ...operationalStages,
    ...archivalStages,
    ...preservationStages,
  ];
  const readyCount = allStages.filter((s) => s.ready).length;

  return {
    version: LIFECYCLE_CONTINUITY_VERSION,
    configId,
    lifecycleStages,
    continuityStages,
    governanceStages,
    operationalStages,
    archivalStages,
    preservationStages,
    summary: `lifecycle-continuity id=${configId} stages=${allStages.length} ready=${readyCount} lifecycle=${lifecycleStages.filter((s) => s.ready).length} governance=${governanceStages.filter((s) => s.ready).length}`,
  };
}
