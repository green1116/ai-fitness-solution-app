/**
 * E07-P1 — Digital Workforce Lifecycle
 */

import {
  E07_WORKFORCE_BASE,
  E07_WORKFORCE_FREEZE_VERSION,
  E07_WORKFORCE_PLATFORM_ID,
  E07_WORKFORCE_VERSION,
  WORKFORCE_LIFECYCLE_STAGES,
  WORKFORCE_LIFECYCLE_TRANSITIONS,
} from "./workforce.constants";
import { buildWorkforceRegistryManifest } from "./workforce.registry";
import type {
  WorkforceFoundationResult,
  WorkforceLifecycle,
  WorkforceLifecycleStage,
  WorkforceLifecycleTransition,
} from "./workforce.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function canAdvanceWorkforceLifecycle(
  from: WorkforceLifecycleStage,
  to: WorkforceLifecycleStage,
): boolean {
  return WORKFORCE_LIFECYCLE_TRANSITIONS.some(
    ([f, t]) => f === from && t === to,
  );
}

export function createInitialWorkforceLifecycle(): WorkforceLifecycle {
  return {
    current: "declared",
    stages: [...WORKFORCE_LIFECYCLE_STAGES],
    transitions: [],
    complete: false,
    readOnly: true,
  };
}

export function advanceWorkforceLifecycle(
  lifecycle: WorkforceLifecycle,
  to: WorkforceLifecycleStage,
  note?: string,
): WorkforceLifecycle {
  if (!canAdvanceWorkforceLifecycle(lifecycle.current, to)) {
    throw new Error(
      `Invalid workforce lifecycle transition: ${lifecycle.current} → ${to}`,
    );
  }

  const transition: WorkforceLifecycleTransition = {
    from: lifecycle.current,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  };

  return {
    current: to,
    stages: [...WORKFORCE_LIFECYCLE_STAGES],
    transitions: [...lifecycle.transitions, transition],
    complete: to === "completed",
    readOnly: true,
  };
}

export function buildWorkforceFoundationLifecycle(): WorkforceLifecycle {
  let lifecycle = createInitialWorkforceLifecycle();
  lifecycle = advanceWorkforceLifecycle(
    lifecycle,
    "registered",
    "worker catalog registered",
  );
  lifecycle = advanceWorkforceLifecycle(
    lifecycle,
    "bound",
    "bound to E06 autonomous operations",
  );
  lifecycle = advanceWorkforceLifecycle(
    lifecycle,
    "activated",
    "digital workers activated",
  );
  lifecycle = advanceWorkforceLifecycle(
    lifecycle,
    "completed",
    "foundation ready",
  );
  return lifecycle;
}

export function buildWorkforceFoundation(): WorkforceFoundationResult {
  const registry = buildWorkforceRegistryManifest();
  const lifecycle = buildWorkforceFoundationLifecycle();
  const ready = registry.catalogComplete && lifecycle.complete;

  return {
    platformId: E07_WORKFORCE_PLATFORM_ID,
    version: E07_WORKFORCE_VERSION,
    freezeVersion: E07_WORKFORCE_FREEZE_VERSION,
    base: E07_WORKFORCE_BASE,
    registry,
    lifecycle,
    ready,
    summary: [
      `e07-workforce-foundation ready=${ready}`,
      `platform=${E07_WORKFORCE_PLATFORM_ID}`,
      `base=${E07_WORKFORCE_BASE}`,
      `workers=${registry.workerCount}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${E07_WORKFORCE_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertWorkforceFoundationPass(
  result: WorkforceFoundationResult,
): asserts result is WorkforceFoundationResult & { ready: true } {
  if (!result.ready) {
    throw new Error(`E07 workforce foundation not ready: ${result.summary}`);
  }
}
