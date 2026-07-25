/**
 * Product Customer Profile — Customer Profile Manager
 */

import {
  assignAttribute,
  clearAttributes,
  getAttribute,
  listAttributes,
} from "./attribute/attribute.registry";
import type {
  AssignAttributeInput,
  CustomerProfileAttribute,
} from "./attribute/attribute.types";
import {
  addContact,
  clearContacts,
  getContact,
  listContacts,
} from "./contact/contact.registry";
import type {
  AddContactInput,
  CustomerProfileContact,
} from "./contact/contact.types";
import {
  clearIdentities,
  getIdentity,
  listIdentities,
  updateIdentityStatus,
  upsertIdentity,
} from "./identity/identity.registry";
import type {
  CustomerProfileIdentity,
  UpdateIdentityStatusInput,
  UpsertIdentityInput,
} from "./identity/identity.types";
import {
  clearPreferences,
  getPreference,
  listPreferences,
  setPreference,
} from "./preference/preference.registry";
import type {
  CustomerProfilePreference,
  SetPreferenceInput,
} from "./preference/preference.types";
import {
  PRODUCT_CUSTOMER_PROFILE_BASE,
  PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION,
  PRODUCT_CUSTOMER_PROFILE_ID,
  PRODUCT_CUSTOMER_PROFILE_VERSION,
} from "./profile/profile.constants";
import {
  assertCustomerProfileReadinessReady,
  evaluateCustomerProfileReadiness,
} from "./profile/profile.readiness";
import type {
  CustomerProfileManagerStatus,
  CustomerProfileReadinessResult,
  CustomerProfileRegistryManifest,
} from "./profile/profile.types";

export type CustomerProfileManagerSnapshot = {
  managerId: string;
  status: CustomerProfileManagerStatus;
  layerId: typeof PRODUCT_CUSTOMER_PROFILE_ID;
  version: typeof PRODUCT_CUSTOMER_PROFILE_VERSION;
  identityCount: number;
  contactCount: number;
  preferenceCount: number;
  attributeCount: number;
  startedAt?: string;
  stoppedAt?: string;
};

export type CustomerProfileManager = {
  initialize: () => CustomerProfileManagerSnapshot;
  start: () => CustomerProfileManagerSnapshot;
  stop: () => CustomerProfileManagerSnapshot;
  status: () => CustomerProfileManagerSnapshot;
  upsertIdentity: (input: UpsertIdentityInput) => CustomerProfileIdentity;
  updateIdentityStatus: (
    input: UpdateIdentityStatusInput,
  ) => CustomerProfileIdentity;
  addContact: (input: AddContactInput) => CustomerProfileContact;
  setPreference: (input: SetPreferenceInput) => CustomerProfilePreference;
  assignAttribute: (
    input: AssignAttributeInput,
  ) => CustomerProfileAttribute;
  evaluateReadiness: () => CustomerProfileReadinessResult;
  manifest: () => CustomerProfileRegistryManifest;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function getCustomerProfileRegistryManifest(): CustomerProfileRegistryManifest {
  return {
    profileId: PRODUCT_CUSTOMER_PROFILE_ID,
    version: PRODUCT_CUSTOMER_PROFILE_VERSION,
    freezeVersion: PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION,
    base: PRODUCT_CUSTOMER_PROFILE_BASE,
    identityCount: listIdentities().length,
    contactCount: listContacts().length,
    preferenceCount: listPreferences().length,
    attributeCount: listAttributes().length,
  };
}

export function clearCustomerProfileLayer(): void {
  clearAttributes();
  clearPreferences();
  clearContacts();
  clearIdentities();
}

export function createCustomerProfileManager(options?: {
  managerId?: string;
}): CustomerProfileManager {
  const managerId =
    options?.managerId?.trim() || createId("prod-cprf-mgr");
  let state: CustomerProfileManagerStatus = "IDLE";
  let startedAt: string | undefined;
  let stoppedAt: string | undefined;

  function snapshot(): CustomerProfileManagerSnapshot {
    const reg = getCustomerProfileRegistryManifest();
    return {
      managerId,
      status: state,
      layerId: PRODUCT_CUSTOMER_PROFILE_ID,
      version: PRODUCT_CUSTOMER_PROFILE_VERSION,
      identityCount: reg.identityCount,
      contactCount: reg.contactCount,
      preferenceCount: reg.preferenceCount,
      attributeCount: reg.attributeCount,
      startedAt,
      stoppedAt,
    };
  }

  function assertRunning(op: string): void {
    if (state !== "RUNNING") {
      throw new Error(`${op} requires RUNNING (current=${state})`);
    }
  }

  function initialize(): CustomerProfileManagerSnapshot {
    if (state !== "IDLE" && state !== "STOPPED") {
      throw new Error(
        `initialize requires IDLE or STOPPED (current=${state})`,
      );
    }
    clearCustomerProfileLayer();
    startedAt = undefined;
    stoppedAt = undefined;
    state = "READY";
    return snapshot();
  }

  function start(): CustomerProfileManagerSnapshot {
    if (state !== "READY" && state !== "STOPPED") {
      throw new Error(`start requires READY or STOPPED (current=${state})`);
    }
    state = "RUNNING";
    startedAt = nowIso();
    stoppedAt = undefined;
    return snapshot();
  }

  function stop(): CustomerProfileManagerSnapshot {
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
    upsertIdentity: (input) => {
      assertRunning("upsertIdentity");
      return upsertIdentity(input);
    },
    updateIdentityStatus: (input) => {
      assertRunning("updateIdentityStatus");
      return updateIdentityStatus(input);
    },
    addContact: (input) => {
      assertRunning("addContact");
      return addContact(input);
    },
    setPreference: (input) => {
      assertRunning("setPreference");
      return setPreference(input);
    },
    assignAttribute: (input) => {
      assertRunning("assignAttribute");
      return assignAttribute(input);
    },
    evaluateReadiness: () => {
      assertRunning("evaluateReadiness");
      return evaluateCustomerProfileReadiness();
    },
    manifest: getCustomerProfileRegistryManifest,
  };
}

export {
  assertCustomerProfileReadinessReady,
  getAttribute,
  getContact,
  getIdentity,
  getPreference,
  listAttributes,
  listContacts,
  listIdentities,
  listPreferences,
};
