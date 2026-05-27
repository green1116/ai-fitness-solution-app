/**
 * V3.7-H19 Production Rollout Foundation
 */

export {
  ROLLOUT_CHECKLIST_VERSION,
  buildRolloutChecklistConfig,
  type RolloutChecklistItem,
  type RolloutChecklistGroup,
  type RolloutChecklistConfig,
  type ChecklistStatus,
  type ChecklistOwner,
} from "./rollout-checklist";

export {
  LAUNCH_SUMMARY_VERSION,
  buildLaunchSummary,
  type LaunchSummary,
} from "./launch-summary";

export {
  HANDOFF_MANIFEST_VERSION,
  ROLLOUT_VERSION,
  buildHandoffManifest,
  type HandoffManifest,
} from "./handoff-manifest";

import { memoFoundation } from "../foundation-memo";
import { buildRolloutChecklistConfig, type RolloutChecklistConfig } from "./rollout-checklist";
import { buildLaunchSummary, type LaunchSummary } from "./launch-summary";
import { buildHandoffManifest, ROLLOUT_VERSION, type HandoffManifest } from "./handoff-manifest";

export const PRODUCTION_ROLLOUT_FOUNDATION_VERSION = ROLLOUT_VERSION;

export type ProductionRolloutFoundation = {
  version: typeof PRODUCTION_ROLLOUT_FOUNDATION_VERSION;
  foundationId: string;
  checklist: RolloutChecklistConfig;
  launch: LaunchSummary;
  handoff: HandoffManifest;
  foundationSummary: string;
};

export function buildProductionRolloutFoundation(input?: {
  deploymentId?: string;
}): ProductionRolloutFoundation {
  const deploymentId = input?.deploymentId ?? "production-rollout-foundation";
  return memoFoundation("production-rollout-foundation", deploymentId, () => {
    const foundationId = `PRF-V37H19-${deploymentId.slice(0, 8)}`;
    const checklist = buildRolloutChecklistConfig({ deploymentId });
    const launch = buildLaunchSummary({ deploymentId });
    const handoff = buildHandoffManifest({ deploymentId });

    return {
      version: PRODUCTION_ROLLOUT_FOUNDATION_VERSION,
      foundationId,
      checklist,
      launch,
      handoff,
      foundationSummary: `production-rollout-foundation id=${foundationId} readyForLaunch=${handoff.readyForLaunch} readyForHandoff=${handoff.readyForHandoff} items=${checklist.checklistItems.length} confidence=${launch.confidenceScore}`,
    };
  });
}
