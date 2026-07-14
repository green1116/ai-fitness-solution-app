/**
 * E03-P1 — Agent Lifecycle foundation
 */

import {
  AGENT_LIFECYCLE_STAGES,
  AGENT_LIFECYCLE_TRANSITIONS,
  E03_AGENT_PLATFORM_FREEZE_VERSION,
  E03_AGENT_PLATFORM_ID,
  E03_AGENT_PLATFORM_VERSION,
} from "./agent.constants";
import { buildAgentRegistryManifest } from "./agent.registry";
import type {
  AgentFoundationResult,
  AgentLifecycle,
  AgentLifecycleStage,
  AgentLifecycleTransition,
} from "./agent.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function canAdvanceLifecycle(
  from: AgentLifecycleStage,
  to: AgentLifecycleStage,
): boolean {
  return AGENT_LIFECYCLE_TRANSITIONS.some(
    ([f, t]) => f === from && t === to,
  );
}

export function advanceLifecycle(
  lifecycle: AgentLifecycle,
  to: AgentLifecycleStage,
  note?: string,
): AgentLifecycle {
  if (!canAdvanceLifecycle(lifecycle.current, to)) {
    throw new Error(
      `Invalid lifecycle transition: ${lifecycle.current} → ${to}`,
    );
  }

  const transition: AgentLifecycleTransition = {
    from: lifecycle.current,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  };

  const transitions = [...lifecycle.transitions, transition];
  const complete = to === "completed";

  return {
    current: to,
    stages: [...AGENT_LIFECYCLE_STAGES],
    transitions,
    complete,
    readOnly: true,
  };
}

export function createInitialLifecycle(): AgentLifecycle {
  return {
    current: "declared",
    stages: [...AGENT_LIFECYCLE_STAGES],
    transitions: [],
    complete: false,
    readOnly: true,
  };
}

export function buildAgentFoundationLifecycle(): AgentLifecycle {
  let lifecycle = createInitialLifecycle();
  lifecycle = advanceLifecycle(lifecycle, "registered", "catalog registered");
  lifecycle = advanceLifecycle(lifecycle, "activated", "agents activated");
  lifecycle = advanceLifecycle(lifecycle, "executing", "foundation probe run");
  lifecycle = advanceLifecycle(lifecycle, "completed", "foundation ready");
  return lifecycle;
}

export function buildAgentFoundation(): AgentFoundationResult {
  const registry = buildAgentRegistryManifest();
  const lifecycle = buildAgentFoundationLifecycle();
  const ready = registry.catalogComplete && lifecycle.complete;

  return {
    platformId: E03_AGENT_PLATFORM_ID,
    version: E03_AGENT_PLATFORM_VERSION,
    freezeVersion: E03_AGENT_PLATFORM_FREEZE_VERSION,
    registry,
    lifecycle,
    ready,
    summary: [
      `e03-agent-foundation ready=${ready}`,
      `platform=${E03_AGENT_PLATFORM_ID}`,
      `agents=${registry.agentCount}`,
      `lifecycle=${lifecycle.current}`,
      `transitions=${lifecycle.transitions.length}`,
      `freeze=${E03_AGENT_PLATFORM_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertAgentFoundationPass(
  result: AgentFoundationResult,
): asserts result is AgentFoundationResult & { ready: true } {
  if (!result.ready) {
    throw new Error(`E03 agent foundation not ready: ${result.summary}`);
  }
}
