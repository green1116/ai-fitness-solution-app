/**
 * Product P12 — Operations registry
 */

import { OPERATIONS_MODES } from "../launch/launch.constants";
import { getLaunch } from "../launch/launch.registry";
import type {
  ActivateOperationsInput,
  LaunchOperations,
  OperationsMode,
} from "./operations.types";

const operations = new Map<string, LaunchOperations>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneOperations(item: LaunchOperations): LaunchOperations {
  return { ...item, metadata: { ...item.metadata } };
}

export function activateOperations(
  input: ActivateOperationsInput,
): LaunchOperations {
  const launchId = input.launchId.trim();
  const owner = input.owner.trim();
  if (!launchId) throw new Error("operations.launchId is required");
  if (!owner) throw new Error("operations.owner is required");
  if (!(OPERATIONS_MODES as readonly string[]).includes(input.mode)) {
    throw new Error(`invalid operations mode: ${input.mode}`);
  }
  if (!getLaunch(launchId)) {
    throw new Error(`launch not found: ${launchId}`);
  }

  const id = input.id?.trim() || createId("p12ops");
  if (operations.has(id)) {
    throw new Error(`operations already exists: ${id}`);
  }

  const runbook =
    (input.runbook ?? "").trim() || `${input.mode} launch runbook`;
  const item: LaunchOperations = {
    id,
    launchId,
    mode: input.mode,
    owner,
    runbook,
    detail: `mode=${input.mode} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    activatedAt: nowIso(),
  };
  operations.set(id, item);
  return cloneOperations(item);
}

export function getOperations(id: string): LaunchOperations | undefined {
  const item = operations.get(id.trim());
  return item ? cloneOperations(item) : undefined;
}

export function listOperations(filter?: {
  launchId?: string;
  mode?: OperationsMode;
}): LaunchOperations[] {
  let result = [...operations.values()];
  if (filter?.launchId) {
    const lid = filter.launchId.trim();
    result = result.filter((o) => o.launchId === lid);
  }
  if (filter?.mode) result = result.filter((o) => o.mode === filter.mode);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneOperations);
}

export function clearOperations(): void {
  operations.clear();
}
