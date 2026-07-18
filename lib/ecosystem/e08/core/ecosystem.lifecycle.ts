/**
 * E08-P1 — Ecosystem Lifecycle
 */

import {
  E08_ECOSYSTEM_BASE,
  E08_ECOSYSTEM_FREEZE_VERSION,
  E08_ECOSYSTEM_PLATFORM_ID,
  E08_ECOSYSTEM_VERSION,
  ECOSYSTEM_LIFECYCLE_STAGES,
  ECOSYSTEM_LIFECYCLE_TRANSITIONS,
} from "./ecosystem.constants";
import { buildEcosystemRegistryManifest } from "./ecosystem.registry";
import type {
  EcosystemFoundationResult,
  EcosystemLifecycle,
  EcosystemLifecycleStage,
  EcosystemLifecycleTransition,
} from "./ecosystem.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function canAdvanceEcosystemLifecycle(
  from: EcosystemLifecycleStage,
  to: EcosystemLifecycleStage,
): boolean {
  return ECOSYSTEM_LIFECYCLE_TRANSITIONS.some(
    ([f, t]) => f === from && t === to,
  );
}

export function createInitialEcosystemLifecycle(): EcosystemLifecycle {
  return {
    current: "declared",
    stages: [...ECOSYSTEM_LIFECYCLE_STAGES],
    transitions: [],
    complete: false,
    readOnly: true,
  };
}

export function advanceEcosystemLifecycle(
  lifecycle: EcosystemLifecycle,
  to: EcosystemLifecycleStage,
  note?: string,
): EcosystemLifecycle {
  if (!canAdvanceEcosystemLifecycle(lifecycle.current, to)) {
    throw new Error(
      `Invalid ecosystem lifecycle transition: ${lifecycle.current} → ${to}`,
    );
  }

  const transition: EcosystemLifecycleTransition = {
    from: lifecycle.current,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  };

  return {
    current: to,
    stages: [...ECOSYSTEM_LIFECYCLE_STAGES],
    transitions: [...lifecycle.transitions, transition],
    complete: to === "completed",
    readOnly: true,
  };
}

export function buildEcosystemFoundationLifecycle(): EcosystemLifecycle {
  let lifecycle = createInitialEcosystemLifecycle();
  lifecycle = advanceEcosystemLifecycle(
    lifecycle,
    "registered",
    "partner catalog registered",
  );
  lifecycle = advanceEcosystemLifecycle(
    lifecycle,
    "bound",
    "bound to E07 digital workers",
  );
  lifecycle = advanceEcosystemLifecycle(
    lifecycle,
    "activated",
    "ecosystem partners activated",
  );
  lifecycle = advanceEcosystemLifecycle(
    lifecycle,
    "completed",
    "foundation ready",
  );
  return lifecycle;
}

export function buildEcosystemFoundation(): EcosystemFoundationResult {
  const registry = buildEcosystemRegistryManifest();
  const lifecycle = buildEcosystemFoundationLifecycle();
  const ready = registry.catalogComplete && lifecycle.complete;

  return {
    platformId: E08_ECOSYSTEM_PLATFORM_ID,
    version: E08_ECOSYSTEM_VERSION,
    freezeVersion: E08_ECOSYSTEM_FREEZE_VERSION,
    base: E08_ECOSYSTEM_BASE,
    registry,
    lifecycle,
    ready,
    summary: [
      `e08-ecosystem-foundation ready=${ready}`,
      `platform=${E08_ECOSYSTEM_PLATFORM_ID}`,
      `base=${E08_ECOSYSTEM_BASE}`,
      `partners=${registry.partnerCount}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${E08_ECOSYSTEM_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertEcosystemFoundationPass(
  result: EcosystemFoundationResult,
): asserts result is EcosystemFoundationResult & { ready: true } {
  if (!result.ready) {
    throw new Error(`E08 ecosystem foundation not ready: ${result.summary}`);
  }
}
