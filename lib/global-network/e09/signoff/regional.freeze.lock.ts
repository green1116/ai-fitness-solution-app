/**
 * E09-P2 — Regional Freeze Lock (read-only)
 * version + base + component lock for Regional Foundation
 */

import {
  E09_REGIONAL_BASE,
  E09_REGIONAL_FREEZE_VERSION,
  E09_REGIONAL_ID,
  E09_REGIONAL_VERSION,
} from "../regional/regional.constants";

export const E09_P2_SIGNOFF_VERSION = "e09-p2-signoff-1" as const;
export const E09_P2_PLATFORM_FREEZE_VERSION =
  "e09-p2-regional-freeze-1" as const;

export type E09P2ComponentId =
  | "foundation"
  | "hub-runtime"
  | "policy"
  | "signoff";

export type E09P2ComponentLock = {
  id: E09P2ComponentId;
  path: string;
  label: string;
  required: true;
};

export type E09P2FreezeLock = {
  version: typeof E09_P2_PLATFORM_FREEZE_VERSION;
  base: typeof E09_REGIONAL_BASE;
  regionalId: typeof E09_REGIONAL_ID;
  layerVersion: typeof E09_REGIONAL_VERSION;
  layerFreeze: typeof E09_REGIONAL_FREEZE_VERSION;
  signoff: typeof E09_P2_SIGNOFF_VERSION;
  components: E09P2ComponentLock[];
};

export const E09_P2_COMPONENT_LOCK: E09P2ComponentLock[] = [
  {
    id: "foundation",
    path: "lib/global-network/e09/regional/",
    label: "Regional Foundation Registry",
    required: true,
  },
  {
    id: "hub-runtime",
    path: "lib/global-network/e09/regional/",
    label: "Regional Hub Runtime",
    required: true,
  },
  {
    id: "policy",
    path: "lib/global-network/e09/regional/",
    label: "Regional Policy Engine",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/global-network/e09/signoff/",
    label: "E09-P2 Regional Freeze Gate",
    required: true,
  },
];

export const E09_P2_FREEZE_LOCK: E09P2FreezeLock = {
  version: E09_P2_PLATFORM_FREEZE_VERSION,
  base: E09_REGIONAL_BASE,
  regionalId: E09_REGIONAL_ID,
  layerVersion: E09_REGIONAL_VERSION,
  layerFreeze: E09_REGIONAL_FREEZE_VERSION,
  signoff: E09_P2_SIGNOFF_VERSION,
  components: E09_P2_COMPONENT_LOCK,
};

export const EXPECTED_E09_P2_FREEZE_LOCK: E09P2FreezeLock = E09_P2_FREEZE_LOCK;

export function isE09P2FreezeLockIntact(): boolean {
  const lock = E09_P2_FREEZE_LOCK;
  return (
    typeof lock.version === "string" &&
    lock.version.length > 0 &&
    typeof lock.base === "string" &&
    lock.base.length > 0 &&
    typeof lock.regionalId === "string" &&
    lock.regionalId.length > 0 &&
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

export function e09P2FreezeLockMatchesExpected(): boolean {
  const lock = E09_P2_FREEZE_LOCK;
  const expected = EXPECTED_E09_P2_FREEZE_LOCK;
  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.regionalId === expected.regionalId &&
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
