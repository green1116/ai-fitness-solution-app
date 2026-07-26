/**
 * Product Preference — Preference Management Manager
 */

import {
  clearPreferenceConsents,
  getPreferenceConsent,
  listPreferenceConsents,
  recordPreferenceConsent,
  updatePreferenceConsent,
} from "./consent/consent.registry";
import type {
  PreferenceConsent,
  RecordPreferenceConsentInput,
  UpdatePreferenceConsentInput,
} from "./consent/consent.types";
import {
  clearPreferenceReleaseManifests,
  createPreferenceReleaseManifest,
  getPreferenceReleaseManifest,
  listPreferenceReleaseManifests,
  type PreferenceReleaseManifest,
} from "./manifest/manifest.registry";
import {
  PRODUCT_PREFERENCE_MANAGEMENT_BASE,
  PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PREFERENCE_MANAGEMENT_ID,
  PRODUCT_PREFERENCE_MANAGEMENT_VERSION,
} from "./management/management.constants";
import {
  assertPreferenceManagementReadinessReady,
  evaluatePreferenceManagementReadiness,
} from "./management/management.readiness";
import type {
  PreferenceManagerStatus,
  PreferenceReadinessResult,
  PreferenceRegistryManifest,
} from "./management/management.types";
import {
  clearPreferences,
  getPreference,
  getPreferenceByKey,
  listPreferences,
  registerPreference,
} from "./registry/preference.registry";
import type {
  NotificationPreference,
  RegisterPreferenceInput,
} from "./registry/preference.types";
import {
  clearPreferenceResolutionRules,
  definePreferenceResolutionRule,
  getPreferenceResolutionRule,
  listPreferenceResolutionRules,
} from "./resolution/resolution.registry";
import type {
  DefinePreferenceResolutionRuleInput,
  PreferenceResolutionRule,
} from "./resolution/resolution.types";
import {
  attachPreferenceScope,
  clearPreferenceScopes,
  getPreferenceScope,
  listPreferenceScopes,
} from "./scope/scope.registry";
import type {
  AttachPreferenceScopeInput,
  PreferenceScope,
} from "./scope/scope.types";
import {
  clearPreferenceValidations,
  getPreferenceValidation,
  listPreferenceValidations,
  validatePreference,
} from "./validation/validation.registry";
import type {
  PreferenceValidation,
  ValidatePreferenceInput,
} from "./validation/validation.types";

export type PreferenceManagerSnapshot = {
  managerId: string;
  status: PreferenceManagerStatus;
  layerId: typeof PRODUCT_PREFERENCE_MANAGEMENT_ID;
  version: typeof PRODUCT_PREFERENCE_MANAGEMENT_VERSION;
  preferenceCount: number;
  scopeCount: number;
  consentCount: number;
  resolutionCount: number;
  validationCount: number;
  releaseCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type PreferenceManager = {
  initialize: () => PreferenceManagerSnapshot;
  start: () => PreferenceManagerSnapshot;
  stop: () => PreferenceManagerSnapshot;
  status: () => PreferenceManagerSnapshot;
  registerPreference: (
    input: RegisterPreferenceInput,
  ) => NotificationPreference;
  attachScope: (input: AttachPreferenceScopeInput) => PreferenceScope;
  recordConsent: (input: RecordPreferenceConsentInput) => PreferenceConsent;
  updateConsent: (input: UpdatePreferenceConsentInput) => PreferenceConsent;
  defineResolutionRule: (
    input: DefinePreferenceResolutionRuleInput,
  ) => PreferenceResolutionRule;
  validatePreference: (
    input: ValidatePreferenceInput,
  ) => PreferenceValidation;
  createReleaseManifest: (input: {
    id?: string;
    preferenceId: string;
  }) => PreferenceReleaseManifest;
  evaluateReadiness: () => PreferenceReadinessResult;
  manifest: () => PreferenceRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getPreferenceRegistryManifest(): PreferenceRegistryManifest {
  return {
    managementId: PRODUCT_PREFERENCE_MANAGEMENT_ID,
    version: PRODUCT_PREFERENCE_MANAGEMENT_VERSION,
    freezeVersion: PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_PREFERENCE_MANAGEMENT_BASE,
    preferenceCount: listPreferences().length,
    scopeCount: listPreferenceScopes().length,
    consentCount: listPreferenceConsents().length,
    resolutionCount: listPreferenceResolutionRules().length,
    validationCount: listPreferenceValidations().length,
    releaseCount: listPreferenceReleaseManifests().length,
  };
}

export function clearPreferenceManagementLayer(): void {
  clearPreferenceReleaseManifests();
  clearPreferenceValidations();
  clearPreferenceResolutionRules();
  clearPreferenceConsents();
  clearPreferenceScopes();
  clearPreferences();
}

export function createPreferenceManager(options?: {
  managerId?: string;
}): PreferenceManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-pref-mgr");
  let state: PreferenceManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): PreferenceManagerSnapshot {
    const reg = getPreferenceRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_PREFERENCE_MANAGEMENT_ID,
      version: PRODUCT_PREFERENCE_MANAGEMENT_VERSION,
      preferenceCount: reg.preferenceCount,
      scopeCount: reg.scopeCount,
      consentCount: reg.consentCount,
      resolutionCount: reg.resolutionCount,
      validationCount: reg.validationCount,
      releaseCount: reg.releaseCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): PreferenceManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearPreferenceManagementLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): PreferenceManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): PreferenceManagerSnapshot {
    if (state !== "RUNNING") {
      throw new Error(`stop requires RUNNING (current=${state})`);
    }
    state = "STOPPED";
    stoppedAt = nowIso();
    return snapshot();
  }

  return {
    initialize,
    start,
    stop,
    status: snapshot,
    registerPreference: (input) => {
      assertRunning("registerPreference");
      return registerPreference(input);
    },
    attachScope: (input) => {
      assertRunning("attachScope");
      return attachPreferenceScope(input);
    },
    recordConsent: (input) => {
      assertRunning("recordConsent");
      return recordPreferenceConsent(input);
    },
    updateConsent: (input) => {
      assertRunning("updateConsent");
      return updatePreferenceConsent(input);
    },
    defineResolutionRule: (input) => {
      assertRunning("defineResolutionRule");
      return definePreferenceResolutionRule(input);
    },
    validatePreference: (input) => {
      assertRunning("validatePreference");
      return validatePreference(input);
    },
    createReleaseManifest: (input) => {
      assertRunning("createReleaseManifest");
      return createPreferenceReleaseManifest(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluatePreferenceManagementReadiness();
    },
    manifest: getPreferenceRegistryManifest,
  };
}

export {
  assertPreferenceManagementReadinessReady,
  getPreference,
  getPreferenceByKey,
  getPreferenceConsent,
  getPreferenceReleaseManifest,
  getPreferenceResolutionRule,
  getPreferenceScope,
  getPreferenceValidation,
  listPreferenceConsents,
  listPreferenceReleaseManifests,
  listPreferenceResolutionRules,
  listPreferenceScopes,
  listPreferenceValidations,
  listPreferences,
};
