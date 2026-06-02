/**
 * V3.7-H22 Enterprise Archival & Preservation Foundation
 */

export {
  ARCHIVAL_CHECKLIST_VERSION,
  buildArchivalChecklist,
  type ArchivalItem,
  type PreservationGroupConfig,
  type ArchivalChecklist,
  type ArchivalStatus,
  type PreservationGroup,
} from "./archival-checklist";

export {
  PRESERVATION_SUMMARY_VERSION,
  buildPreservationSummary,
  type PreservationSummary,
} from "./preservation-summary";

export {
  ARCHIVAL_MANIFEST_VERSION,
  ARCHIVAL_VERSION,
  buildArchivalManifest,
  type ArchivalManifest,
} from "./archival-manifest";

import { memoFoundation } from "../foundation-memo";
import { buildArchivalChecklist, type ArchivalChecklist } from "./archival-checklist";
import { buildPreservationSummary, type PreservationSummary } from "./preservation-summary";
import { buildArchivalManifest, ARCHIVAL_VERSION, type ArchivalManifest } from "./archival-manifest";

export const PRODUCTION_ARCHIVAL_VERSION = ARCHIVAL_VERSION;

export type EnterpriseArchivalFoundation = {
  version: typeof PRODUCTION_ARCHIVAL_VERSION;
  foundationId: string;
  checklist: ArchivalChecklist;
  preservation: PreservationSummary;
  manifest: ArchivalManifest;
  foundationSummary: string;
};

export function buildEnterpriseArchivalFoundation(input?: {
  deploymentId?: string;
}): EnterpriseArchivalFoundation {
  const deploymentId = input?.deploymentId ?? "enterprise-archival-foundation";
  return memoFoundation("enterprise-archival-foundation", deploymentId, () => {
    const foundationId = `EAF-V37H22-${deploymentId.slice(0, 8)}`;
    const checklist = buildArchivalChecklist({ deploymentId });
    const preservation = buildPreservationSummary({ deploymentId });
    const manifest = buildArchivalManifest({ deploymentId });

    return {
      version: PRODUCTION_ARCHIVAL_VERSION,
      foundationId,
      checklist,
      preservation,
      manifest,
      foundationSummary: `enterprise-archival-foundation id=${foundationId} readyForArchive=${manifest.readyForArchive} readyForPreservation=${manifest.readyForPreservation} items=${checklist.archivalItems.length} confidence=${preservation.confidenceScore}`,
    };
  });
}
