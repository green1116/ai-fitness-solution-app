/**
 * E09-P6 — Agent Freeze Manifest Builder (read-only)
 */

import {
  E09_AGENT_BASE,
  E09_AGENT_FREEZE_VERSION,
  E09_AGENT_ID,
  E09_AGENT_VERSION,
} from "../agent/agent.constants";
import { buildAgentRegistryManifest } from "../agent/agent.registry";
import {
  E09_P6_FREEZE_LOCK,
  E09_P6_PLATFORM_FREEZE_VERSION,
  E09_P6_SIGNOFF_VERSION,
  e09P6FreezeLockMatchesExpected,
  isE09P6FreezeLockIntact,
  type E09P6FreezeLock,
} from "./agent.freeze.lock";
import {
  checkE09P6ReleaseGate,
  type GateVerdict,
  type ReleaseGateResult,
} from "./agent.release.gate";

export type E09P6FreezeState = {
  frozen: boolean;
  versionLockOk: boolean;
  gatePass: boolean;
  state: "frozen" | "unfrozen" | "blocked";
};

export type E09P6FreezeManifest = {
  version: typeof E09_P6_PLATFORM_FREEZE_VERSION;
  signoff: typeof E09_P6_SIGNOFF_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  base: typeof E09_AGENT_BASE;
  agentId: typeof E09_AGENT_ID;
  layerVersion: typeof E09_AGENT_VERSION;
  layerFreeze: typeof E09_AGENT_FREEZE_VERSION;
  lock: E09P6FreezeLock;
  versionLockOk: boolean;
  gate: ReleaseGateResult;
  freezeState: E09P6FreezeState;
  foundationReady: boolean;
  summary: string;
};

export function buildE09P6FreezeManifest(input?: {
  deploymentId?: string;
}): E09P6FreezeManifest {
  const deploymentId = input?.deploymentId ?? "e09-p6-freeze-default";
  const registry = buildAgentRegistryManifest();
  const gate = checkE09P6ReleaseGate();
  const versionLockOk =
    isE09P6FreezeLockIntact() && e09P6FreezeLockMatchesExpected();
  const gatePass = gate.result === "PASS";

  const foundationReady =
    registry.agentId === E09_AGENT_ID &&
    registry.version === E09_AGENT_VERSION &&
    registry.base === E09_AGENT_BASE &&
    registry.freezeVersion === E09_AGENT_FREEZE_VERSION;

  const frozen = versionLockOk && gatePass && foundationReady;
  const freezeState: E09P6FreezeState = {
    frozen,
    versionLockOk,
    gatePass,
    state: frozen ? "frozen" : versionLockOk ? "unfrozen" : "blocked",
  };

  return {
    version: E09_P6_PLATFORM_FREEZE_VERSION,
    signoff: E09_P6_SIGNOFF_VERSION,
    freezeId: `e09-p6-freeze-${deploymentId}`,
    frozenAt: new Date().toISOString(),
    deploymentId,
    base: E09_AGENT_BASE,
    agentId: E09_AGENT_ID,
    layerVersion: E09_AGENT_VERSION,
    layerFreeze: E09_AGENT_FREEZE_VERSION,
    lock: {
      ...E09_P6_FREEZE_LOCK,
      components: [...E09_P6_FREEZE_LOCK.components],
    },
    versionLockOk,
    gate,
    freezeState,
    foundationReady,
    summary: [
      `e09-p6-freeze frozen=${frozen}`,
      `gate=${gate.result as GateVerdict}`,
      `versionLock=${versionLockOk}`,
      `foundationReady=${foundationReady}`,
      `state=${freezeState.state}`,
    ].join(" "),
  };
}

export function assertE09P6FreezePass(
  manifest: E09P6FreezeManifest = buildE09P6FreezeManifest(),
): asserts manifest is E09P6FreezeManifest & {
  freezeState: E09P6FreezeState & { frozen: true };
} {
  if (!manifest.freezeState.frozen) {
    throw new Error(`E09-P6 freeze not complete: ${manifest.summary}`);
  }
}
