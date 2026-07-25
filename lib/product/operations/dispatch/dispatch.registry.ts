/**
 * Product Operations — Dispatch registry
 */

import { OPS_DISPATCH_STATUSES } from "../console/console.constants";
import { getOpsIncident } from "../incident/incident.registry";
import { getOpsPlaybook } from "../playbook/playbook.registry";
import type {
  OpsDispatch,
  OpsDispatchStatus,
  QueueOpsDispatchInput,
  RunOpsDispatchInput,
} from "./dispatch.types";

const dispatches = new Map<string, OpsDispatch>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDispatch(dispatch: OpsDispatch): OpsDispatch {
  return { ...dispatch, metadata: { ...dispatch.metadata } };
}

export function queueOpsDispatch(
  input: QueueOpsDispatchInput,
): OpsDispatch {
  const incidentId = input.incidentId.trim();
  const playbookId = input.playbookId.trim();
  if (!incidentId) throw new Error("dispatch.incidentId is required");
  if (!playbookId) throw new Error("dispatch.playbookId is required");

  const incident = getOpsIncident(incidentId);
  if (!incident) throw new Error(`incident not found: ${incidentId}`);
  const playbook = getOpsPlaybook(playbookId);
  if (!playbook) throw new Error(`playbook not found: ${playbookId}`);
  if (playbook.surfaceId !== incident.surfaceId) {
    throw new Error(`surface mismatch: ${playbookId}/${incidentId}`);
  }

  const id = input.id?.trim() || createId("opsdsp");
  if (dispatches.has(id)) throw new Error(`dispatch already exists: ${id}`);

  const now = nowIso();
  const dispatch: OpsDispatch = {
    id,
    incidentId,
    playbookId,
    status: OPS_DISPATCH_STATUSES[0],
    detail: `status=QUEUED`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  dispatches.set(id, dispatch);
  return cloneDispatch(dispatch);
}

export function runOpsDispatch(input: RunOpsDispatchInput): OpsDispatch {
  const dispatchId = input.dispatchId.trim();
  if (!dispatchId) throw new Error("dispatch.dispatchId is required");

  const existing = dispatches.get(dispatchId);
  if (!existing) throw new Error(`dispatch not found: ${dispatchId}`);
  if (existing.status === "RUNNING") {
    throw new Error(`dispatch already running: ${dispatchId}`);
  }
  if (existing.status === "SUCCEEDED") {
    throw new Error(`dispatch already succeeded: ${dispatchId}`);
  }

  const updated: OpsDispatch = {
    ...existing,
    status: "SUCCEEDED",
    detail: `status=SUCCEEDED`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  dispatches.set(dispatchId, updated);
  return cloneDispatch(updated);
}

export function getOpsDispatch(id: string): OpsDispatch | undefined {
  const dispatch = dispatches.get(id.trim());
  return dispatch ? cloneDispatch(dispatch) : undefined;
}

export function listOpsDispatches(filter?: {
  incidentId?: string;
  playbookId?: string;
  status?: OpsDispatchStatus;
}): OpsDispatch[] {
  let result = [...dispatches.values()];
  if (filter?.incidentId) {
    const incidentId = filter.incidentId.trim();
    result = result.filter((d) => d.incidentId === incidentId);
  }
  if (filter?.playbookId) {
    const playbookId = filter.playbookId.trim();
    result = result.filter((d) => d.playbookId === playbookId);
  }
  if (filter?.status) {
    result = result.filter((d) => d.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDispatch);
}

export function clearOpsDispatches(): void {
  dispatches.clear();
}
