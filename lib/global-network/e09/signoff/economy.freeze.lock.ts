/**
 * E09-P5 — Economy Freeze Lock (read-only)
 * version + base + component lock for Autonomous Network Economy
 */

import {
  E09_ECONOMY_BASE,
  E09_ECONOMY_FREEZE_VERSION,
  E09_ECONOMY_ID,
  E09_ECONOMY_VERSION,
} from "../economy/economy.constants";

export const E09_P5_SIGNOFF_VERSION = "e09-p5-signoff-1" as const;
export const E09_P5_PLATFORM_FREEZE_VERSION =
  "e09-p5-economy-freeze-1" as const;

export type E09P5ComponentId =
  | "foundation"
  | "flow"
  | "runtime"
  | "signoff";

export type E09P5ComponentLock = {
  id: E09P5ComponentId;
  path: string;
  label: string;
  required: true;
};

export type E09P5FreezeLock = {
  version: typeof E09_P5_PLATFORM_FREEZE_VERSION;
  base: typeof E09_ECONOMY_BASE;
  economyId: typeof E09_ECONOMY_ID;
  layerVersion: typeof E09_ECONOMY_VERSION;
  layerFreeze: typeof E09_ECONOMY_FREEZE_VERSION;
  signoff: typeof E09_P5_SIGNOFF_VERSION;
  components: E09P5ComponentLock[];
};

export const E09_P5_COMPONENT_LOCK: E09P5ComponentLock[] = [
  {
    id: "foundation",
    path: "lib/global-network/e09/economy/",
    label: "Economy Foundation Registry",
    required: true,
  },
  {
    id: "flow",
    path: "lib/global-network/e09/economy/",
    label: "Value Flow Engine",
    required: true,
  },
  {
    id: "runtime",
    path: "lib/global-network/e09/economy/",
    label: "Economy Runtime",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/global-network/e09/signoff/",
    label: "E09-P5 Economy Freeze Gate",
    required: true,
  },
];

export const E09_P5_FREEZE_LOCK: E09P5FreezeLock = {
  version: E09_P5_PLATFORM_FREEZE_VERSION,
  base: E09_ECONOMY_BASE,
  economyId: E09_ECONOMY_ID,
  layerVersion: E09_ECONOMY_VERSION,
  layerFreeze: E09_ECONOMY_FREEZE_VERSION,
  signoff: E09_P5_SIGNOFF_VERSION,
  components: E09_P5_COMPONENT_LOCK,
};

export const EXPECTED_E09_P5_FREEZE_LOCK: E09P5FreezeLock = E09_P5_FREEZE_LOCK;

export function isE09P5FreezeLockIntact(): boolean {
  const lock = E09_P5_FREEZE_LOCK;
  return (
    typeof lock.version === "string" &&
    lock.version.length > 0 &&
    typeof lock.base === "string" &&
    lock.base.length > 0 &&
    typeof lock.economyId === "string" &&
    lock.economyId.length > 0 &&
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

export function e09P5FreezeLockMatchesExpected(): boolean {
  const lock = E09_P5_FREEZE_LOCK;
  const expected = EXPECTED_E09_P5_FREEZE_LOCK;
  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.economyId === expected.economyId &&
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
