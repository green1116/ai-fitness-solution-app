/**
 * V3.7-H25 Enterprise Preservation Closure — static config (no runtime)
 */

import { buildEnterpriseLifecycleFoundation } from "../lifecycle/index";
import { buildEnterpriseRetentionFoundation } from "../retention/index";
import { buildEnterpriseArchivalFoundation } from "../archival/index";
import { buildEnterpriseLaunchClosureFoundation } from "../launch-closure/index";

export const PRESERVATION_CLOSURE_CONFIG_VERSION = "3.7-h25-closure-config-1" as const;

export type PreservationClosureStage = {
  id: string;
  label: string;
  category: string;
  ready: boolean;
  href?: string;
  apiHref?: string;
  description: string;
};

export type PreservationClosureConfig = {
  version: typeof PRESERVATION_CLOSURE_CONFIG_VERSION;
  configId: string;
  preservationStages: PreservationClosureStage[];
  closureStages: PreservationClosureStage[];
  governanceClosureStages: PreservationClosureStage[];
  operationalClosureStages: PreservationClosureStage[];
  archivalClosureStages: PreservationClosureStage[];
  lifecycleClosureStages: PreservationClosureStage[];
  summary: string;
};

function closureStage(
  id: string,
  label: string,
  category: string,
  ready: boolean,
  description: string,
  href?: string,
  apiHref?: string,
): PreservationClosureStage {
  return { id, label, category, ready, description, href, apiHref };
}

export function buildPreservationClosureConfig(input?: {
  deploymentId?: string;
}): PreservationClosureConfig {
  const deploymentId = input?.deploymentId ?? "preservation-closure";
  const configId = `PCC-V37H25-${deploymentId.slice(0, 8)}`;

  const lifecycle = buildEnterpriseLifecycleFoundation({ deploymentId });
  const retention = buildEnterpriseRetentionFoundation({ deploymentId });
  const archival = buildEnterpriseArchivalFoundation({ deploymentId });
  const launchClosure = buildEnterpriseLaunchClosureFoundation({ deploymentId });

  const completion = lifecycle.completion;
  const continuity = lifecycle.continuity;

  const preservationStages: PreservationClosureStage[] = [
    closureStage("ps-retention", "Retention preservation", "preservation", retention.access.preservationReady, "Archive access and retention review preserved.", "/dashboard/archive-access", "/api/commercialization/archive-access"),
    closureStage("ps-archival", "Archival preservation", "preservation", archival.preservation.preservationCompleted, "Enterprise archival foundation preserved.", "/dashboard/archival", "/api/commercialization/archival"),
    closureStage("ps-evidence", "Evidence preservation", "preservation", launchClosure.closure.releaseCompleted, "Static evidence export preserved.", "/dashboard/evidence-export", "/api/commercialization/evidence-export"),
    closureStage("ps-lifecycle", "Lifecycle preservation", "preservation", completion.preservationContinuityReady, "Full lifecycle continuity preserved.", "/dashboard/lifecycle", "/api/commercialization/lifecycle"),
  ];

  const closureStages: PreservationClosureStage[] = [
    closureStage("cs-launch-closure", "Launch closure finalized", "closure", launchClosure.manifest.readyForClosure, "Enterprise launch closure complete.", "/dashboard/launch-closure", "/api/commercialization/launch-closure"),
    closureStage("cs-lifecycle-closure", "Lifecycle closure gate", "closure", lifecycle.manifest.readyForContinuity, "Lifecycle continuity closure gate.", "/dashboard/lifecycle"),
    closureStage("cs-preservation-closure", "Preservation closure gate", "closure", retention.manifest.readyForEnterprise, "Preservation closure foundation.", "/dashboard/preservation-closure", "/api/commercialization/preservation-closure"),
  ];

  const governanceClosureStages: PreservationClosureStage[] = continuity.governanceStages.map((s) =>
    closureStage(`gcs-${s.id}`, s.label, "governance", s.ready, s.description, s.href, s.apiHref),
  );

  const operationalClosureStages: PreservationClosureStage[] = continuity.operationalStages.map((s) =>
    closureStage(`ocs-${s.id}`, s.label, "operational", s.ready, s.description, s.href, s.apiHref),
  );

  const archivalClosureStages: PreservationClosureStage[] = continuity.archivalStages.map((s) =>
    closureStage(`acs-${s.id}`, s.label, "archival", s.ready, s.description, s.href, s.apiHref),
  );

  const lifecycleClosureStages: PreservationClosureStage[] = continuity.lifecycleStages.map((s) =>
    closureStage(`lcs-${s.id}`, s.label, "lifecycle", s.ready, s.description, s.href, s.apiHref),
  );

  const allStages = [
    ...preservationStages,
    ...closureStages,
    ...governanceClosureStages,
    ...operationalClosureStages,
    ...archivalClosureStages,
    ...lifecycleClosureStages,
  ];
  const readyCount = allStages.filter((s) => s.ready).length;

  return {
    version: PRESERVATION_CLOSURE_CONFIG_VERSION,
    configId,
    preservationStages,
    closureStages,
    governanceClosureStages,
    operationalClosureStages,
    archivalClosureStages,
    lifecycleClosureStages,
    summary: `preservation-closure id=${configId} stages=${allStages.length} ready=${readyCount} preservation=${preservationStages.filter((s) => s.ready).length} closure=${closureStages.filter((s) => s.ready).length}`,
  };
}
