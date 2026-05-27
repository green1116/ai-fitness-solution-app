/**
 * V3.7-H25 Enterprise Preservation Closure Foundation
 */

export {
  PRESERVATION_CLOSURE_CONFIG_VERSION,
  buildPreservationClosureConfig,
  type PreservationClosureStage,
  type PreservationClosureConfig,
} from "./preservation-closure";

export {
  PRESERVATION_CLOSURE_SUMMARY_VERSION,
  buildPreservationClosureSummary,
  type PreservationClosureSummary,
} from "./preservation-summary";

export {
  PRESERVATION_CLOSURE_MANIFEST_VERSION,
  PRESERVATION_CLOSURE_VERSION,
  buildPreservationClosureManifest,
  type PreservationClosureManifest,
} from "./preservation-manifest";

import { memoFoundation } from "../foundation-memo";
import { buildPreservationClosureConfig, type PreservationClosureConfig } from "./preservation-closure";
import { buildPreservationClosureSummary, type PreservationClosureSummary } from "./preservation-summary";
import {
  PRESERVATION_CLOSURE_MANIFEST_VERSION,
  PRESERVATION_CLOSURE_VERSION,
  type PreservationClosureManifest,
} from "./preservation-manifest";
import { LIFECYCLE_VERSION } from "../lifecycle/lifecycle-manifest";
import { RETENTION_VERSION } from "../retention/retention-manifest";
import { ARCHIVAL_VERSION } from "../archival/archival-manifest";
import { LAUNCH_CLOSURE_VERSION } from "../launch-closure/launch-closure-manifest";

export const PRODUCTION_PRESERVATION_CLOSURE_VERSION = PRESERVATION_CLOSURE_VERSION;

export type EnterprisePreservationClosureFoundation = {
  version: typeof PRODUCTION_PRESERVATION_CLOSURE_VERSION;
  foundationId: string;
  closure: PreservationClosureConfig;
  summary: PreservationClosureSummary;
  manifest: PreservationClosureManifest;
  foundationSummary: string;
};

function buildPreservationClosureManifestFromSummary(
  deploymentId: string,
  summary: PreservationClosureSummary,
): PreservationClosureManifest {
  const manifestId = `PCM-V37H25-${deploymentId.slice(0, 8)}`;
  const readyForPreservationClosure =
    summary.preservationReady && summary.confidenceScore >= 80;
  const readyForLifecycleClosure =
    readyForPreservationClosure &&
    summary.lifecycleClosureReady &&
    summary.archivalClosureReady;
  const readyForEnterprise =
    readyForLifecycleClosure &&
    summary.governanceClosureReady &&
    summary.operationalClosureReady &&
    summary.closureReady;

  return {
    version: PRESERVATION_CLOSURE_MANIFEST_VERSION,
    manifestId,
    PRESERVATION_CLOSURE_VERSION,
    LIFECYCLE_VERSION,
    RETENTION_VERSION,
    ARCHIVAL_VERSION,
    LAUNCH_CLOSURE_VERSION,
    readyForPreservationClosure,
    readyForLifecycleClosure,
    readyForEnterprise,
    summary: `preservation-closure-manifest id=${manifestId} readyForPreservationClosure=${readyForPreservationClosure} readyForLifecycleClosure=${readyForLifecycleClosure} readyForEnterprise=${readyForEnterprise} confidence=${summary.confidenceScore}`,
  };
}

export function buildEnterprisePreservationClosureFoundation(input?: {
  deploymentId?: string;
}): EnterprisePreservationClosureFoundation {
  const deploymentId = input?.deploymentId ?? "enterprise-preservation-closure-foundation";
  return memoFoundation("enterprise-preservation-closure-foundation", deploymentId, () => {
    const foundationId = `EPF-V37H25-${deploymentId.slice(0, 8)}`;
    const closure = buildPreservationClosureConfig({ deploymentId });
    const summary = buildPreservationClosureSummary({ deploymentId });
    const manifest = buildPreservationClosureManifestFromSummary(deploymentId, summary);

    return {
      version: PRODUCTION_PRESERVATION_CLOSURE_VERSION,
      foundationId,
      closure,
      summary,
      manifest,
      foundationSummary: `enterprise-preservation-closure-foundation id=${foundationId} readyForPreservationClosure=${manifest.readyForPreservationClosure} readyForLifecycleClosure=${manifest.readyForLifecycleClosure} stages=${closure.preservationStages.length} confidence=${summary.confidenceScore}`,
    };
  });
}
