/**
 * ESCA — Advocacy public exports
 */

export {
  ESCA_1_ID,
  ADVOCACY_STATE_CAPABILITY,
  ADVOCACY_STATE_VERSION,
  ESRN_V1_BASELINE,
  ADVOCACY_STATES,
  advocacyStateFromSignals,
  buildAdvocacyState,
  getAdvocacyState,
  advocacyStateFingerprint,
  clearAdvocacyState,
  type AdvocacyStateLevel,
  type AdvocacyStateRecord,
  type AdvocacyState,
} from "./advocacy-state";

export {
  ESCA_2_ID,
  ADVOCACY_READINESS_CAPABILITY,
  ADVOCACY_READINESS_VERSION,
  ESCA1_ADVOCACY_STATE_BASELINE,
  ADVOCACY_READINESSES,
  advocacyReadinessFromState,
  buildAdvocacyReadiness,
  getAdvocacyReadiness,
  advocacyReadinessFingerprint,
  clearAdvocacyReadiness,
  ensureStateThenBuildAdvocacyReadiness,
  type AdvocacyReadinessKind,
  type AdvocacyReadinessRecord,
  type AdvocacyReadiness,
} from "./advocacy-readiness";

export {
  ESCA_3_ID,
  ADVOCACY_ACTION_SIGNAL_CAPABILITY,
  ADVOCACY_ACTION_SIGNAL_VERSION,
  ESCA2_ADVOCACY_READINESS_BASELINE,
  ADVOCACY_ACTION_SIGNALS,
  advocacyActionSignalFromSignals,
  buildAdvocacyActionSignal,
  getAdvocacyActionSignal,
  advocacyActionSignalFingerprint,
  clearAdvocacyActionSignal,
  ensureReadinessThenBuildAdvocacyActionSignal,
  type AdvocacyActionSignalKind,
  type AdvocacyActionSignalRecord,
  type AdvocacyActionSignal,
} from "./advocacy-action-signal";

export {
  ESCA_FREEZE_ID,
  ESCA_FREEZE_CAPABILITY,
  ESCA_FREEZE_VERSION,
  ESCA_FREEZE_CODENAME,
  ESCA_FREEZE_DATE,
  ENTERPRISE_SAAS_CUSTOMER_ADVOCACY_OPERATIONS_V1,
  ESCA_COMPONENTS,
  buildEscaFreeze,
  getEscaFreeze,
  escaFreezeFingerprint,
  clearEscaFreeze,
  ensureSignalThenBuildEscaFreeze,
  type EscaComponentStatus,
  type EscaComponentEntry,
  type EscaFreezeManifest,
  type EscaFreeze,
} from "./advocacy-freeze-manifest";
