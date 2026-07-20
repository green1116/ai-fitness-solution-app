/**
 * E09-P6 — Agent Freeze Lock (read-only)
 * version + base + component lock for Global Agent Federation
 */

import {
  E09_AGENT_BASE,
  E09_AGENT_FREEZE_VERSION,
  E09_AGENT_ID,
  E09_AGENT_VERSION,
} from "../agent/agent.constants";

export const E09_P6_SIGNOFF_VERSION = "e09-p6-signoff-1" as const;
export const E09_P6_PLATFORM_FREEZE_VERSION =
  "e09-p6-agent-freeze-1" as const;

export type E09P6ComponentId =
  | "foundation"
  | "coordinator"
  | "runtime"
  | "signoff";

export type E09P6ComponentLock = {
  id: E09P6ComponentId;
  path: string;
  label: string;
  required: true;
};

export type E09P6FreezeLock = {
  version: typeof E09_P6_PLATFORM_FREEZE_VERSION;
  base: typeof E09_AGENT_BASE;
  agentId: typeof E09_AGENT_ID;
  layerVersion: typeof E09_AGENT_VERSION;
  layerFreeze: typeof E09_AGENT_FREEZE_VERSION;
  signoff: typeof E09_P6_SIGNOFF_VERSION;
  components: E09P6ComponentLock[];
};

export const E09_P6_COMPONENT_LOCK: E09P6ComponentLock[] = [
  {
    id: "foundation",
    path: "lib/global-network/e09/agent/",
    label: "Agent Foundation Registry",
    required: true,
  },
  {
    id: "coordinator",
    path: "lib/global-network/e09/agent/",
    label: "Agent Coordinator",
    required: true,
  },
  {
    id: "runtime",
    path: "lib/global-network/e09/agent/",
    label: "Agent Runtime",
    required: true,
  },
  {
    id: "signoff",
    path: "lib/global-network/e09/signoff/",
    label: "E09-P6 Agent Freeze Gate",
    required: true,
  },
];

export const E09_P6_FREEZE_LOCK: E09P6FreezeLock = {
  version: E09_P6_PLATFORM_FREEZE_VERSION,
  base: E09_AGENT_BASE,
  agentId: E09_AGENT_ID,
  layerVersion: E09_AGENT_VERSION,
  layerFreeze: E09_AGENT_FREEZE_VERSION,
  signoff: E09_P6_SIGNOFF_VERSION,
  components: E09_P6_COMPONENT_LOCK,
};

export const EXPECTED_E09_P6_FREEZE_LOCK: E09P6FreezeLock = E09_P6_FREEZE_LOCK;

export function isE09P6FreezeLockIntact(): boolean {
  const lock = E09_P6_FREEZE_LOCK;
  return (
    typeof lock.version === "string" &&
    lock.version.length > 0 &&
    typeof lock.base === "string" &&
    lock.base.length > 0 &&
    typeof lock.agentId === "string" &&
    lock.agentId.length > 0 &&
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

export function e09P6FreezeLockMatchesExpected(): boolean {
  const lock = E09_P6_FREEZE_LOCK;
  const expected = EXPECTED_E09_P6_FREEZE_LOCK;
  return (
    lock.version === expected.version &&
    lock.base === expected.base &&
    lock.agentId === expected.agentId &&
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
