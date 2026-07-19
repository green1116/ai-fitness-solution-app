/**
 * E09-P3 — Market Freeze Manifest Builder (read-only)
 */

import {
  E09_MARKET_BASE,
  E09_MARKET_FREEZE_VERSION,
  E09_MARKET_ID,
  E09_MARKET_VERSION,
} from "../market/market.constants";
import { buildMarketRegistryManifest } from "../market/market.registry";
import {
  E09_P3_FREEZE_LOCK,
  E09_P3_PLATFORM_FREEZE_VERSION,
  E09_P3_SIGNOFF_VERSION,
  e09P3FreezeLockMatchesExpected,
  isE09P3FreezeLockIntact,
  type E09P3FreezeLock,
} from "./market.freeze.lock";
import {
  checkE09P3ReleaseGate,
  type GateVerdict,
  type ReleaseGateResult,
} from "./market.release.gate";

export type E09P3FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  gatePass: boolean;
  state: "frozen" | "unfrozen" | "blocked";
};

export type E09P3FreezeManifest = {
  version: typeof E09_P3_PLATFORM_FREEZE_VERSION;
  signoff: typeof E09_P3_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof E09_MARKET_BASE;
  marketId: typeof E09_MARKET_ID;
  layerVersion: typeof E09_MARKET_VERSION;
  layerFreeze: typeof E09_MARKET_FREEZE_VERSION;
  lock: E09P3FreezeLock;
  versionLockOk: boolean;
  gate: ReleaseGateResult;
  freezeState: E09P3FreezeState;
  foundationReady: boolean;
  summary: string;
};

export function buildE09P3FreezeManifest(input?: {
  deploymentId?: string;
}): E09P3FreezeManifest {
  const deploymentId = input?.deploymentId ?? "e09-p3-freeze-default";
  const registry = buildMarketRegistryManifest();
  const gate = checkE09P3ReleaseGate();
  const versionLockOk =
    isE09P3FreezeLockIntact() && e09P3FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";

  const foundationReady =
    registry.marketId === E09_MARKET_ID &&
    registry.version === E09_MARKET_VERSION &&
    registry.base === E09_MARKET_BASE &&
    registry.freezeVersion === E09_MARKET_FREEZE_VERSION;

  const frozen = versionLockOk && gatePass && foundationReady;
  const freezeState: E09P3FreezeState = {
    frozen,
    versionLockOk,
    gatePass,
    state: frozen ? "frozen" : versionLockOk ? "unfrozen" : "blocked",
  };

  return {
    version: E09_P3_PLATFORM_FREEZE_VERSION,
    signoff: E09_P3_SIGNOFF_VERSION,
    freezeId: `e09-p3-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: E09_MARKET_BASE,
    marketId: E09_MARKET_ID,
    layerVersion: E09_MARKET_VERSION,
    layerFreeze: E09_MARKET_FREEZE_VERSION,
    lock: {
      ...E09_P3_FREEZE_LOCK,
      components: [...E09_P3_FREEZE_LOCK.components],
    },
    versionLockOk,
    gate,
    freezeState,
    foundationReady,
    summary: [
      `e09-p3-freeze frozen=${frozen}`,
      `gate=${gate.result as GateVerdict}`,
      `versionLock=${versionLockOk}`,
      `foundationReady=${foundationReady}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

export function assertE09P3FreezePass(
  manifest: E09P3FreezeManifest = buildE09P3FreezeManifest(),
): asserts manifest is E09P3FreezeManifest & {
  freezeState: E09P3FreezeState & { frozen: true };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(`E09-P3 freeze not complete: ${manifest.summary}`);
  }
}
