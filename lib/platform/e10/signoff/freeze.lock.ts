/**
 * E10-P1 — Platform Freeze Lock (read-only)
 * version + base + component lock for Platform Kernel
 */

import {
  E10_PLATFORM_BASE,
  E10_PLATFORM_FREEZE_VERSION,
  E10_PLATFORM_ID,
  E10_PLATFORM_VERSION,
} from "../core/platform.constants";

export const E10_P1_SIGNOFF_VERSION = "e10-p1-signoff-1" as const;
export const E10_P1_PLATFORM_FREEZE_VERSION =
  "e10-p1-platform-foundation-freeze-1" as const;

export type E10P1ComponentId = "core" | "runtime" | "signoff";

export type E10P1ComponentLock = {
  id: E10P1ComponentId;
  path: string;
  label: string;
  required: true;
};

export type E10P1FreezeLock = {
  version: typeof E10_P1_PLATFORM_FREEZE_VERSION;
  base: typeof E10_PLATFORM_BASE;
  platformId: typeof E10_PLATFORM_ID;
  layerVersion: typeof E10_PLATFORM_VERSION;
  layerFreeze: typeof E10_PLATFORM_FREEZE_VERSION;
  signoff: typeof E10_P1_SIGNOFF_VERSION;
  components: E10P1ComponentLock[];
};

export const E10_P1_COMPONENT_LOCK: E10P1ComponentLock[] = [
  {
    id: "core",
    path: "lib/platform/e10/core/",
    label: "Platform Foundation Core",
    required: true,
  },
  {
    id: "runtime",
    path: "lib/platform/e10/core/",
    label: "Platform Runtime Stub",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/platform/e10/signoff/",
    label: "E10-P1 Freeze Gate",
    required: true,
  },
];

export const E10_P1_FREEZE_LOCK: E10P1FreezeLock = {
  version: E10_P1_PLATFORM_FREEZE_VERSION,
  base: E10_PLATFORM_BASE,
  platformId: E10_PLATFORM_ID,
  layerVersion: E10_PLATFORM_VERSION,
  layerFreeze: E10_PLATFORM_FREEZE_VERSION,
  signoff: E10_P1_SIGNOFF_VERSION,
  components: E10_P1_COMPONENT_LOCK,
};

export const EXPECTED_E10_P1_FREEZE_LOCK: E10P1FreezeLock = E10_P1_FREEZE_LOCK;

export function isE10P1FreezeLockIntact(): boolean {
  const lock = E10_P1_FREEZE_LOCK;
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
    lock.components.length >= 3 &&
    lock.components.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.path === "string" &&
        typeof c.label === "string" &&
        c.required === true,
    )
  );
}

export function e10P1FreezeLockMatchesExpected(): boolean {
  const lock = E10_P1_FREEZE_LOCK;
  const expected = EXPECTED_E10_P1_FREEZE_LOCK;
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
