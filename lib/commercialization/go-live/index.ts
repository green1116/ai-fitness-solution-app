/**
 * V3.7-H20 Production Go-Live Foundation
 */

export {
  GO_LIVE_CHECKLIST_VERSION,
  buildGoLiveChecklistConfig,
  type GoLiveChecklistItem,
  type GoLiveChecklistGroup,
  type GoLiveChecklistConfig,
  type GoLiveCheckStatus,
  type GoLiveCheckCategory,
} from "./go-live-checklist";

export {
  LAUNCH_FREEZE_SUMMARY_VERSION,
  buildLaunchFreezeSummary,
  type LaunchFreezeSummary,
} from "./launch-freeze-summary";

export {
  GO_LIVE_MANIFEST_VERSION,
  GO_LIVE_VERSION,
  buildGoLiveManifest,
  type GoLiveManifest,
} from "./go-live-manifest";

import { memoFoundation } from "../foundation-memo";
import { buildGoLiveChecklistConfig, type GoLiveChecklistConfig } from "./go-live-checklist";
import { buildLaunchFreezeSummary, type LaunchFreezeSummary } from "./launch-freeze-summary";
import { buildGoLiveManifest, GO_LIVE_VERSION, type GoLiveManifest } from "./go-live-manifest";

export const PRODUCTION_GO_LIVE_FOUNDATION_VERSION = GO_LIVE_VERSION;

export type ProductionGoLiveFoundation = {
  version: typeof PRODUCTION_GO_LIVE_FOUNDATION_VERSION;
  foundationId: string;
  checklist: GoLiveChecklistConfig;
  freeze: LaunchFreezeSummary;
  manifest: GoLiveManifest;
  foundationSummary: string;
};

export function buildProductionGoLiveFoundation(input?: {
  deploymentId?: string;
}): ProductionGoLiveFoundation {
  const deploymentId = input?.deploymentId ?? "production-go-live-foundation";
  return memoFoundation("production-go-live-foundation", deploymentId, () => {
    const foundationId = `PGF-V37H20-${deploymentId.slice(0, 8)}`;
    const checklist = buildGoLiveChecklistConfig({ deploymentId });
    const freeze = buildLaunchFreezeSummary({ deploymentId });
    const manifest = buildGoLiveManifest({ deploymentId });

    return {
      version: PRODUCTION_GO_LIVE_FOUNDATION_VERSION,
      foundationId,
      checklist,
      freeze,
      manifest,
      foundationSummary: `production-go-live-foundation id=${foundationId} readyForGoLive=${manifest.readyForGoLive} readyForFreeze=${manifest.readyForFreeze} items=${checklist.checklistItems.length} confidence=${freeze.confidenceScore}`,
    };
  });
}
