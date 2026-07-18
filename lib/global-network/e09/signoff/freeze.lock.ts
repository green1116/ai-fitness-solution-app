/**
 * E09-P1 — Global Network Freeze Lock (read-only)
 * version + base + component lock for P1 foundation
 */

import {
  E09_GLOBAL_NETWORK_BASE,
  E09_GLOBAL_NETWORK_FREEZE_VERSION,
  E09_GLOBAL_NETWORK_PLATFORM_ID,
  E09_GLOBAL_NETWORK_VERSION,
} from "../core/global.constants";

export const E09_P1_SIGNOFF_VERSION = "e09-p1-signoff-1" as const;
export const E09_P1_PLATFORM_FREEZE_VERSION =
  "e09-p1-global-network-freeze-1" as const;

export type E09P1ComponentId =
  | "core"
  | "network"
  | "runtime"
  | "identity"
  | "signoff";

export type E09P1ComponentLock = {
  id: E09P1ComponentId;
  path: string;
  label: string;
  required: true;
};

export type E09P1FreezeLock = {
  version: typeof E09_P1_PLATFORM_FREEZE_VERSION;
  base: typeof E09_GLOBAL_NETWORK_BASE;
  platformId: typeof E09_GLOBAL_NETWORK_PLATFORM_ID;
  layerVersion: typeof E09_GLOBAL_NETWORK_VERSION;
  layerFreeze: typeof E09_GLOBAL_NETWORK_FREEZE_VERSION;
  signoff: typeof E09_P1_SIGNOFF_VERSION;
  components: E09P1ComponentLock[];
};

export const E09_P1_COMPONENT_LOCK: E09P1ComponentLock[] = [
  {
    id: "core",
    path: "lib/global-network/e09/core/",
    label: "Global Network Foundation Core",
    required: true,
  },
  {
    id: "network",
    path: "lib/global-network/e09/network/",
    label: "Network Graph Engine",
    required: true,
  },
  {
    id: "runtime",
    path: "lib/global-network/e09/runtime/",
    label: "Global Network Runtime Kernel",
    required: true,
  },
  {
    id: "identity",
    path: "lib/global-network/e09/identity/",
    label: "Global Identity Layer",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/global-network/e09/signoff/",
    label: "E09-P1 Freeze Gate",
    required: true,
  },
];

export const E09_P1_FREEZE_LOCK: E09P1FreezeLock = {
  version: E09_P1_PLATFORM_FREEZE_VERSION,
  base: E09_GLOBAL_NETWORK_BASE,
  platformId: E09_GLOBAL_NETWORK_PLATFORM_ID,
  layerVersion: E09_GLOBAL_NETWORK_VERSION,
  layerFreeze: E09_GLOBAL_NETWORK_FREEZE_VERSION,
  signoff: E09_P1_SIGNOFF_VERSION,
  components: E09_P1_COMPONENT_LOCK,
};

export const EXPECTED_E09_P1_FREEZE_LOCK: E09P1FreezeLock = E09_P1_FREEZE_LOCK;

export function isE09P1FreezeLockIntact(): boolean {
  const lock = E09_P1_FREEZE_LOCK;
  return (
    typeof lock.version === "string" &&
    lock.version.length > 0 &&
    typeof lock.base === "string" &&
    lock.base.length > 0 &&
    typeof lock.platformId === "string" &&
    lock.platformId.length > 0 &&
    typeof lock.layerVersion === "string" &&
    lock.layerVersion.length > 0 &&
    typeof lock.layerFreeze === "string" &&
    lock.layerFreeze.length > 0 &&
    typeof lock.signoff === "string" &&
    lock.signoff.length > 0 &&
    Array.isArray(lock.components) &&
    lock.components.length >= 5 &&
    lock.components.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.path === "string" &&
        typeof c.label === "string" &&
        c.required === true,
    )
  );
}

export function e09P1FreezeLockMatchesExpected(): boolean {
  const lock = E09_P1_FREEZE_LOCK;
  const expected = EXPECTED_E09_P1_FREEZE_LOCK;
  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.platformId === expected.platformId &&
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
