/**
 * V100 — Pilot final sign-off & baseline freeze
 */

export {
  V100_PILOT_SIGNOFF_VERSION,
  PILOT_BASELINE_VERSION,
  type CapabilityEntry,
  type ChecklistStatus,
  type FreezeManifest,
  type GovernanceChecklistItem,
  type LayerReadinessEntry,
  type PilotGovernance,
  type PilotReleaseStatus,
  type PilotSignoffActionEntry,
  type PilotSignoffActionType,
  type PilotSignoffDashboard,
  type PilotSignoffReport,
  type PilotSignoffState,
  type ReleaseManifest,
  type RollbackIndex,
} from "./pilot-signoff/signoff.types";

export {
  getCapabilityByVersion,
  getCapabilityCatalog,
} from "./pilot-signoff/capability-catalog";

export {
  clearSignoffCacheForTests,
  getSignoffState,
  listSignoffActions,
} from "./pilot-signoff/signoff-cache";

export {
  buildPilotSignoffReport,
  collectLayerReadiness,
  deriveReleaseStatus,
} from "./pilot-signoff/signoff.service";

export {
  buildFreezeManifest,
  buildReleaseManifest,
  buildRollbackIndex,
} from "./pilot-signoff/release-manifest.service";

export { buildPilotGovernance } from "./pilot-signoff/governance.service";

export {
  collectReadiness,
  finalSignoff,
  freezeBaseline,
  releaseBaseline,
} from "./pilot-signoff/signoff-action.service";

export { buildPilotSignoffDashboard } from "./pilot-signoff/signoff-dashboard.service";
