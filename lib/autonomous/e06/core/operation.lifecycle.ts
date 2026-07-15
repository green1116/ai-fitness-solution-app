/**
 * E06-P1 — Operation Lifecycle
 */

import {
  E06_OPERATION_BASE,
  E06_OPERATION_FREEZE_VERSION,
  E06_OPERATION_PLATFORM_ID,
  E06_OPERATION_VERSION,
  OPERATION_LIFECYCLE_STAGES,
  OPERATION_LIFECYCLE_TRANSITIONS,
} from "./operation.constants";
import { buildOperationRegistryManifest } from "./operation.registry";
import { buildOperationPolicyRegistryManifest } from "../policy/operation.policy.registry";
import type {
  OperationFoundationResult,
  OperationLifecycle,
  OperationLifecycleStage,
  OperationLifecycleTransition,
} from "./operation.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function canAdvanceOperationLifecycle(
  from: OperationLifecycleStage,
  to: OperationLifecycleStage,
): boolean {
  return OPERATION_LIFECYCLE_TRANSITIONS.some(
    ([f, t]) => f === from && t === to,
  );
}

export function createInitialOperationLifecycle(): OperationLifecycle {
  return {
    current: "declared",
    stages: [...OPERATION_LIFECYCLE_STAGES],
    transitions: [],
    complete: false,
    readOnly: true,
  };
}

export function advanceOperationLifecycle(
  lifecycle: OperationLifecycle,
  to: OperationLifecycleStage,
  note?: string,
): OperationLifecycle {
  if (!canAdvanceOperationLifecycle(lifecycle.current, to)) {
    throw new Error(
      `Invalid operation lifecycle transition: ${lifecycle.current} → ${to}`,
    );
  }

  const transition: OperationLifecycleTransition = {
    from: lifecycle.current,
    to,
    at: nowIso(),
    note,
    readOnly: true,
  };

  return {
    current: to,
    stages: [...OPERATION_LIFECYCLE_STAGES],
    transitions: [...lifecycle.transitions, transition],
    complete: to === "completed",
    readOnly: true,
  };
}

export function buildOperationFoundationLifecycle(): OperationLifecycle {
  let lifecycle = createInitialOperationLifecycle();
  lifecycle = advanceOperationLifecycle(
    lifecycle,
    "registered",
    "catalog registered",
  );
  lifecycle = advanceOperationLifecycle(
    lifecycle,
    "bound",
    "bound to E05 intelligence modules",
  );
  lifecycle = advanceOperationLifecycle(
    lifecycle,
    "activated",
    "autonomous operations activated",
  );
  lifecycle = advanceOperationLifecycle(
    lifecycle,
    "completed",
    "foundation ready",
  );
  return lifecycle;
}

export function buildOperationFoundation(): OperationFoundationResult {
  const registry = buildOperationRegistryManifest();
  const policies = buildOperationPolicyRegistryManifest();
  const lifecycle = buildOperationFoundationLifecycle();
  const ready =
    registry.catalogComplete && policies.catalogComplete && lifecycle.complete;

  return {
    platformId: E06_OPERATION_PLATFORM_ID,
    version: E06_OPERATION_VERSION,
    freezeVersion: E06_OPERATION_FREEZE_VERSION,
    base: E06_OPERATION_BASE,
    registry,
    policies,
    lifecycle,
    ready,
    summary: [
      `e06-operation-foundation ready=${ready}`,
      `platform=${E06_OPERATION_PLATFORM_ID}`,
      `base=${E06_OPERATION_BASE}`,
      `operations=${registry.operationCount}`,
      `policies=${policies.policyCount}`,
      `lifecycle=${lifecycle.current}`,
      `freeze=${E06_OPERATION_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertOperationFoundationPass(
  result: OperationFoundationResult,
): asserts result is OperationFoundationResult & { ready: true } {
  if (!result.ready) {
    throw new Error(`E06 operation foundation not ready: ${result.summary}`);
  }
}
