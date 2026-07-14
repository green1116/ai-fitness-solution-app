/**
 * E05-P1 — Intelligence Lifecycle
 */

import {
  E05_INTELLIGENCE_BASE,
  E05_INTELLIGENCE_FREEZE_VERSION,
  E05_INTELLIGENCE_PLATFORM_ID,
  E05_INTELLIGENCE_VERSION,
  INTELLIGENCE_LIFECYCLE_STAGES,
  INTELLIGENCE_LIFECYCLE_TRANSITIONS,
} from "./intelligence.constants";
import { buildIntelligenceRegistryManifest } from "./intelligence.registry";
import type {
  IntelligenceFoundationResult,
  IntelligenceLifecycle,
  IntelligenceLifecycleStage,
  IntelligenceLifecycleTransition,
} from "./intelligence.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function canAdvanceIntelligenceLifecycle(
  from: IntelligenceLifecycleStage,
  to: IntelligenceLifecycleStage,
): boolean {
  return INTELLIGENCE_LIFECYCLE_TRANSITIONS.some(
    ([f, t]) => f === from && t === to,
  );
}

export function createInitialIntelligenceLifecycle(): IntelligenceLifecycle {
  return {
    current: "declared",
    stages: [...INTELLIGENCE_LIFECYCLE_STAGES],
    transitions: [],
    complete: false,
    readOnly: true,
  };
}

export function advanceIntelligenceLifecycle(
  lifecycle: IntelligenceLifecycle,
  to: IntelligenceLifecycleStage,
  note?: string,
): IntelligenceLifecycle {
  if (!canAdvanceIntelligenceLifecycle(lifecycle.current, to)) {
    throw new Error(
      `Invalid intelligence lifecycle transition: ${lifecycle.current} → ${to}`,
    );
  }

  const transition: IntelligenceLifecycleTransition = {
    from: lifecycle.current,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  };

  return {
    current: to,
    stages: [...INTELLIGENCE_LIFECYCLE_STAGES],
    transitions: [...lifecycle.transitions, transition],
    complete: to === "completed",
    readOnly: true,
  };
}

export function buildIntelligenceFoundationLifecycle(): IntelligenceLifecycle {
  let lifecycle = createInitialIntelligenceLifecycle();
  lifecycle = advanceIntelligenceLifecycle(
    lifecycle,
    "registered",
    "catalog registered",
  );
  lifecycle = advanceIntelligenceLifecycle(
    lifecycle,
    "bound",
    "bound to E04 business agents",
  );
  lifecycle = advanceIntelligenceLifecycle(
    lifecycle,
    "activated",
    "intelligence modules activated",
  );
  lifecycle = advanceIntelligenceLifecycle(
    lifecycle,
    "completed",
    "foundation ready",
  );
  return lifecycle;
}

export function buildIntelligenceFoundation(): IntelligenceFoundationResult {
  const registry = buildIntelligenceRegistryManifest();
  const lifecycle = buildIntelligenceFoundationLifecycle();
  const ready = registry.catalogComplete && lifecycle.complete;

  return {
    platformId: E05_INTELLIGENCE_PLATFORM_ID,
    version: E05_INTELLIGENCE_VERSION,
    freezeVersion: E05_INTELLIGENCE_FREEZE_VERSION,
    base: E05_INTELLIGENCE_BASE,
    registry,
    lifecycle,
    ready,
    summary: [
      `e05-intelligence-foundation ready=${ready}`,
      `platform=${E05_INTELLIGENCE_PLATFORM_ID}`,
      `base=${E05_INTELLIGENCE_BASE}`,
      `modules=${registry.moduleCount}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${E05_INTELLIGENCE_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertIntelligenceFoundationPass(
  result: IntelligenceFoundationResult,
): asserts result is IntelligenceFoundationResult & { ready: true } {
  if (!result.ready) {
    throw new Error(`E05 intelligence foundation not ready: ${result.summary}`);
  }
}
