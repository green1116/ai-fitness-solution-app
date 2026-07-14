/**
 * E04-P1 — Business Agent Lifecycle
 */

import {
  BUSINESS_AGENT_LIFECYCLE_STAGES,
  BUSINESS_AGENT_LIFECYCLE_TRANSITIONS,
  E04_BUSINESS_AGENT_BASE,
  E04_BUSINESS_AGENT_FREEZE_VERSION,
  E04_BUSINESS_AGENT_PLATFORM_ID,
  E04_BUSINESS_AGENT_VERSION,
} from "./business-agent.constants";
import { buildBusinessAgentRegistryManifest } from "./business-agent.registry";
import type {
  BusinessAgentFoundationResult,
  BusinessAgentLifecycle,
  BusinessAgentLifecycleStage,
  BusinessAgentLifecycleTransition,
} from "./business-agent.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function canAdvanceBusinessLifecycle(
  from: BusinessAgentLifecycleStage,
  to: BusinessAgentLifecycleStage,
): boolean {
  return BUSINESS_AGENT_LIFECYCLE_TRANSITIONS.some(
    ([f, t]) => f === from && t === to,
  );
}

export function createInitialBusinessLifecycle(): BusinessAgentLifecycle {
  return {
    current: "declared",
    stages: [...BUSINESS_AGENT_LIFECYCLE_STAGES],
    transitions: [],
    complete: false,
    readOnly: true,
  };
}

export function advanceBusinessLifecycle(
  lifecycle: BusinessAgentLifecycle,
  to: BusinessAgentLifecycleStage,
  note?: string,
): BusinessAgentLifecycle {
  if (!canAdvanceBusinessLifecycle(lifecycle.current, to)) {
    throw new Error(
      `Invalid business agent lifecycle transition: ${lifecycle.current} → ${to}`,
    );
  }

  const transition: BusinessAgentLifecycleTransition = {
    from: lifecycle.current,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  };

  return {
    current: to,
    stages: [...BUSINESS_AGENT_LIFECYCLE_STAGES],
    transitions: [...lifecycle.transitions, transition],
    complete: to === "completed",
    readOnly: true,
  };
}

export function buildBusinessAgentFoundationLifecycle(): BusinessAgentLifecycle {
  let lifecycle = createInitialBusinessLifecycle();
  lifecycle = advanceBusinessLifecycle(lifecycle, "registered", "catalog registered");
  lifecycle = advanceBusinessLifecycle(lifecycle, "bound", "bound to E03 runtime agents");
  lifecycle = advanceBusinessLifecycle(lifecycle, "activated", "business agents activated");
  lifecycle = advanceBusinessLifecycle(lifecycle, "completed", "foundation ready");
  return lifecycle;
}

export function buildBusinessAgentFoundation(): BusinessAgentFoundationResult {
  const registry = buildBusinessAgentRegistryManifest();
  const lifecycle = buildBusinessAgentFoundationLifecycle();
  const ready = registry.catalogComplete && lifecycle.complete;

  return {
    platformId: E04_BUSINESS_AGENT_PLATFORM_ID,
    version: E04_BUSINESS_AGENT_VERSION,
    freezeVersion: E04_BUSINESS_AGENT_FREEZE_VERSION,
    base: E04_BUSINESS_AGENT_BASE,
    registry,
    lifecycle,
    ready,
    summary: [
      `e04-business-agent-foundation ready=${ready}`,
      `platform=${E04_BUSINESS_AGENT_PLATFORM_ID}`,
      `base=${E04_BUSINESS_AGENT_BASE}`,
      `agents=${registry.agentCount}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${E04_BUSINESS_AGENT_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertBusinessAgentFoundationPass(
  result: BusinessAgentFoundationResult,
): asserts result is BusinessAgentFoundationResult & { ready: true } {
  if (!result.ready) {
    throw new Error(`E04 business agent foundation not ready: ${result.summary}`);
  }
}
