/**
 * V100 — Pilot sign-off dashboard (final readiness report)
 */

import { getSignoffState, listSignoffActions } from "./signoff-cache";
import { buildPilotGovernance } from "./governance.service";
import {
  buildFreezeManifest,
  buildReleaseManifest,
  buildRollbackIndex,
} from "./release-manifest.service";
import { buildPilotSignoffReport } from "./signoff.service";
import type { PilotSignoffDashboard } from "./signoff.types";
import { PILOT_BASELINE_VERSION, V100_PILOT_SIGNOFF_VERSION } from "./signoff.types";

export function buildPilotSignoffDashboard(
  organizationId: string,
): PilotSignoffDashboard {
  const state = getSignoffState(organizationId);

  return {
    version: V100_PILOT_SIGNOFF_VERSION,
    organizationId,
    generatedAt: new Date().toISOString(),
    baselineVersion: PILOT_BASELINE_VERSION,
    releaseStatus: state.releaseStatus,
    signoffReport: buildPilotSignoffReport(organizationId),
    freezeManifest: buildFreezeManifest(organizationId),
    releaseManifest: buildReleaseManifest(),
    rollbackIndex: buildRollbackIndex(),
    governance: buildPilotGovernance(organizationId),
    recentActions: listSignoffActions(organizationId).slice(0, 20),
    readOnly: true,
  };
}
