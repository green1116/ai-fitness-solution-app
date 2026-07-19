/**
 * E09-P3 — Market Freeze Lock (read-only)
 * version + base + component lock for Market Foundation
 */

import {
  E09_MARKET_BASE,
  E09_MARKET_FREEZE_VERSION,
  E09_MARKET_ID,
  E09_MARKET_VERSION,
} from "../market/market.constants";

export const E09_P3_SIGNOFF_VERSION = "e09-p3-signoff-1" as const;
export const E09_P3_PLATFORM_FREEZE_VERSION =
  "e09-p3-market-freeze-1" as const;

export type E09P3ComponentId =
  | "foundation"
  | "intelligence"
  | "cross-market"
  | "signoff";

export type E09P3ComponentLock = {
  id: E09P3ComponentId;
  path: string;
  label: string;
  required: true;
};

export type E09P3FreezeLock = {
  version: typeof E09_P3_PLATFORM_FREEZE_VERSION;
  base: typeof E09_MARKET_BASE;
  marketId: typeof E09_MARKET_ID;
  layerVersion: typeof E09_MARKET_VERSION;
  layerFreeze: typeof E09_MARKET_FREEZE_VERSION;
  signoff: typeof E09_P3_SIGNOFF_VERSION;
  components: E09P3ComponentLock[];
};

export const E09_P3_COMPONENT_LOCK: E09P3ComponentLock[] = [
  {
    id: "foundation",
    path: "lib/global-network/e09/market/",
    label: "Market Foundation Registry",
    required: true,
  },
  {
    id: "intelligence",
    path: "lib/global-network/e09/market/",
    label: "Market Intelligence",
    required: true,
  },
  {
    id: "cross-market",
    path: "lib/global-network/e09/market/",
    label: "Cross Market Signal Engine",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/global-network/e09/signoff/",
    label: "E09-P3 Market Freeze Gate",
    required: true,
  },
];

export const E09_P3_FREEZE_LOCK: E09P3FreezeLock = {
  version: E09_P3_PLATFORM_FREEZE_VERSION,
  base: E09_MARKET_BASE,
  marketId: E09_MARKET_ID,
  layerVersion: E09_MARKET_VERSION,
  layerFreeze: E09_MARKET_FREEZE_VERSION,
  signoff: E09_P3_SIGNOFF_VERSION,
  components: E09_P3_COMPONENT_LOCK,
};

export const EXPECTED_E09_P3_FREEZE_LOCK: E09P3FreezeLock = E09_P3_FREEZE_LOCK;

export function isE09P3FreezeLockIntact(): boolean {
  const lock = E09_P3_FREEZE_LOCK;
  return (
    typeof lock.version === "string" &&
    lock.version.length > 0 &&
    typeof lock.base === "string" &&
    lock.base.length > 0 &&
    typeof lock.marketId === "string" &&
    lock.marketId.length > 0 &&
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

export function e09P3FreezeLockMatchesExpected(): boolean {
  const lock = E09_P3_FREEZE_LOCK;
  const expected = EXPECTED_E09_P3_FREEZE_LOCK;
  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.marketId === expected.marketId &&
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
