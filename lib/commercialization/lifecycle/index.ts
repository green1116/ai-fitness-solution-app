/**
 * V3.7-H24 Enterprise Lifecycle Foundation
 */

export {
  LIFECYCLE_CONTINUITY_VERSION,
  buildLifecycleContinuityConfig,
  type LifecycleStage,
  type LifecycleContinuityConfig,
} from "./lifecycle-continuity";

export {
  LIFECYCLE_SUMMARY_VERSION,
  buildLifecycleCompletionSummary,
  type LifecycleCompletionSummary,
} from "./lifecycle-summary";

export {
  LIFECYCLE_MANIFEST_VERSION,
  LIFECYCLE_VERSION,
  buildLifecycleManifest,
  type LifecycleManifest,
} from "./lifecycle-manifest";

import { memoFoundation } from "../foundation-memo";
import { buildLifecycleContinuityConfig, type LifecycleContinuityConfig } from "./lifecycle-continuity";
import { buildLifecycleCompletionSummary, type LifecycleCompletionSummary } from "./lifecycle-summary";
import { buildLifecycleManifest, LIFECYCLE_VERSION, type LifecycleManifest } from "./lifecycle-manifest";

export const PRODUCTION_LIFECYCLE_VERSION = LIFECYCLE_VERSION;

export type EnterpriseLifecycleFoundation = {
  version: typeof PRODUCTION_LIFECYCLE_VERSION;
  foundationId: string;
  continuity: LifecycleContinuityConfig;
  completion: LifecycleCompletionSummary;
  manifest: LifecycleManifest;
  foundationSummary: string;
};

export function buildEnterpriseLifecycleFoundation(input?: {
  deploymentId?: string;
}): EnterpriseLifecycleFoundation {
  const deploymentId = input?.deploymentId ?? "enterprise-lifecycle-foundation";
  return memoFoundation("enterprise-lifecycle-foundation", deploymentId, () => {
    const foundationId = `ELF-V37H24-${deploymentId.slice(0, 8)}`;
    const continuity = buildLifecycleContinuityConfig({ deploymentId });
    const completion = buildLifecycleCompletionSummary({ deploymentId });
    const manifest = buildLifecycleManifest({ deploymentId });

    return {
      version: PRODUCTION_LIFECYCLE_VERSION,
      foundationId,
      continuity,
      completion,
      manifest,
      foundationSummary: `enterprise-lifecycle-foundation id=${foundationId} readyForLifecycle=${manifest.readyForLifecycle} readyForContinuity=${manifest.readyForContinuity} stages=${continuity.lifecycleStages.length} confidence=${completion.confidenceScore}`,
    };
  });
}
