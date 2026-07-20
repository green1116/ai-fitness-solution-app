/**
 * E09-P4 — Federation Freeze Lock (read-only)
 * version + base + component lock for Federation Foundation
 */

import {
  E09_FEDERATION_BASE,
  E09_FEDERATION_FREEZE_VERSION,
  E09_FEDERATION_ID,
  E09_FEDERATION_VERSION,
} from "../federation/federation.constants";

export const E09_P4_SIGNOFF_VERSION = "e09-p4-signoff-1" as const;
export const E09_P4_PLATFORM_FREEZE_VERSION =
  "e09-p4-federation-freeze-1" as const;

export type E09P4ComponentId =
  | "foundation"
  | "trust-graph"
  | "runtime"
  | "signoff";

export type E09P4ComponentLock = {
  id: E09P4ComponentId;
  path: string;
  label: string;
  required: true;
};

export type E09P4FreezeLock = {
  version: typeof E09_P4_PLATFORM_FREEZE_VERSION;
  base: typeof E09_FEDERATION_BASE;
  federationId: typeof E09_FEDERATION_ID;
  layerVersion: typeof E09_FEDERATION_VERSION;
  layerFreeze: typeof E09_FEDERATION_FREEZE_VERSION;
  signoff: typeof E09_P4_SIGNOFF_VERSION;
  components: E09P4ComponentLock[];
};

export const E09_P4_COMPONENT_LOCK: E09P4ComponentLock[] = [
  {
    id: "foundation",
    path: "lib/global-network/e09/federation/",
    label: "Federation Foundation Registry",
    required: true,
  },
  {
    id: "trust-graph",
    path: "lib/global-network/e09/federation/",
    label: "Federation Trust Graph",
    required: true,
  },
  {
    id: "runtime",
    path: "lib/global-network/e09/federation/",
    label: "Federation Runtime",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/global-network/e09/signoff/",
    label: "E09-P4 Federation Freeze Gate",
    required: true,
  },
];

export const E09_P4_FREEZE_LOCK: E09P4FreezeLock = {
  version: E09_P4_PLATFORM_FREEZE_VERSION,
  base: E09_FEDERATION_BASE,
  federationId: E09_FEDERATION_ID,
  layerVersion: E09_FEDERATION_VERSION,
  layerFreeze: E09_FEDERATION_FREEZE_VERSION,
  signoff: E09_P4_SIGNOFF_VERSION,
  components: E09_P4_COMPONENT_LOCK,
};

export const EXPECTED_E09_P4_FREEZE_LOCK: E09P4FreezeLock = E09_P4_FREEZE_LOCK;

export function isE09P4FreezeLockIntact(): boolean {
  const lock = E09_P4_FREEZE_LOCK;
  return (
    typeof lock.version === "string" &&
    lock.version.length > 0 &&
    typeof lock.base === "string" &&
    lock.base.length > 0 &&
    typeof lock.federationId === "string" &&
    lock.federationId.length > 0 &&
    typeof lock.layerVersion === "string" &&
    lock.layerVersion.length > 0 &&
    typeof lock.layerFreeze === "string" &&
    lock.layerFreeze.length > 0 &&
    typeof lock.signoff === "string" &&
    lock.signoff.length > 0 &&
    Array.isArray(lock.components) &&
    lock.components.length >= 4 &&
    lock.components.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.path === "string" &&
        typeof c.label === "string" &&
        c.required === true,
    )
  );
}

export function e09P4FreezeLockMatchesExpected(): boolean {
  const lock = E09_P4_FREEZE_LOCK;
  const expected = EXPECTED_E09_P4_FREEZE_LOCK;
  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.federationId === expected.federationId &&
    lock.layerVersion === expected.layerVersion &&
    lock.layerFreeze === expected.layerFreeze &&
    lock.signoff === expected.signoff &&
    lock.components.length === expected.components.length &&
    lock.components.every(
      (c, i) =>
        c.id === expected.components[i]?.id &&
        c.path === expected.components[i]?.path,
    )
  );
}
