/**
 * V3.7-H21 Enterprise Launch Closure Foundation
 */

export {
  LAUNCH_CLOSURE_CHECKLIST_VERSION,
  buildLaunchClosureChecklist,
  type LaunchClosureItem,
  type CompletionGroup,
  type LaunchClosureChecklist,
  type ClosureStatus,
  type ClosureGroup,
} from "./launch-closure-checklist";

export {
  READINESS_CLOSURE_SUMMARY_VERSION,
  buildReadinessClosureSummary,
  type ReadinessClosureSummary,
} from "./readiness-closure-summary";

export {
  LAUNCH_CLOSURE_MANIFEST_VERSION,
  LAUNCH_CLOSURE_VERSION,
  buildLaunchClosureManifest,
  type LaunchClosureManifest,
} from "./launch-closure-manifest";

import { memoFoundation } from "../foundation-memo";
import { buildLaunchClosureChecklist, type LaunchClosureChecklist } from "./launch-closure-checklist";
import { buildReadinessClosureSummary, type ReadinessClosureSummary } from "./readiness-closure-summary";
import {
  buildLaunchClosureManifest,
  LAUNCH_CLOSURE_VERSION,
  type LaunchClosureManifest,
} from "./launch-closure-manifest";

export const PRODUCTION_LAUNCH_CLOSURE_VERSION = LAUNCH_CLOSURE_VERSION;

export type EnterpriseLaunchClosureFoundation = {
  version: typeof PRODUCTION_LAUNCH_CLOSURE_VERSION;
  foundationId: string;
  checklist: LaunchClosureChecklist;
  closure: ReadinessClosureSummary;
  manifest: LaunchClosureManifest;
  foundationSummary: string;
};

export function buildEnterpriseLaunchClosureFoundation(input?: {
  deploymentId?: string;
}): EnterpriseLaunchClosureFoundation {
  const deploymentId = input?.deploymentId ?? "enterprise-launch-closure-foundation";
  return memoFoundation("enterprise-launch-closure-foundation", deploymentId, () => {
    const foundationId = `ELF-V37H21-${deploymentId.slice(0, 8)}`;
    const checklist = buildLaunchClosureChecklist({ deploymentId });
    const closure = buildReadinessClosureSummary({ deploymentId });
    const manifest = buildLaunchClosureManifest({ deploymentId });

    return {
      version: PRODUCTION_LAUNCH_CLOSURE_VERSION,
      foundationId,
      checklist,
      closure,
      manifest,
      foundationSummary: `enterprise-launch-closure-foundation id=${foundationId} readyForClosure=${manifest.readyForClosure} readyForArchive=${manifest.readyForArchive} items=${checklist.closureItems.length} confidence=${closure.confidenceScore}`,
    };
  });
}
