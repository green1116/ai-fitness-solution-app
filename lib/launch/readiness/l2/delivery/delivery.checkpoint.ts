/**
 * Launch L2 — Delivery checkpoint
 */

import { DELIVERY_CHECKPOINT_KINDS } from "../pilot/pilot.constants";
import { getPilotProject } from "../project/project.tracker";
import type {
  DeliveryCheckpoint,
  DeliveryCheckpointKind,
  RecordCheckpointInput,
} from "./delivery.types";

const checkpoints = new Map<string, DeliveryCheckpoint>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCheckpoint(
  checkpoint: DeliveryCheckpoint,
): DeliveryCheckpoint {
  return { ...checkpoint, metadata: { ...checkpoint.metadata } };
}

export function recordDeliveryCheckpoint(
  input: RecordCheckpointInput,
): DeliveryCheckpoint {
  const projectId = input.projectId.trim();
  if (!projectId) throw new Error("checkpoint.projectId is required");
  if (!getPilotProject(projectId)) {
    throw new Error(`pilot project not found: ${projectId}`);
  }
  if (
    !(DELIVERY_CHECKPOINT_KINDS as readonly string[]).includes(input.kind)
  ) {
    throw new Error(`invalid checkpoint kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("l2chk");
  if (checkpoints.has(id)) {
    throw new Error(`delivery checkpoint already exists: ${id}`);
  }

  const completed = input.completed !== false;
  const title =
    (input.title ?? "").trim() || `${input.kind} checkpoint`;
  const checkpoint: DeliveryCheckpoint = {
    id,
    projectId,
    kind: input.kind,
    title,
    completed,
    detail: `kind=${input.kind} completed=${completed}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  checkpoints.set(id, checkpoint);
  return cloneCheckpoint(checkpoint);
}

export function getDeliveryCheckpoint(
  id: string,
): DeliveryCheckpoint | undefined {
  const checkpoint = checkpoints.get(id.trim());
  return checkpoint ? cloneCheckpoint(checkpoint) : undefined;
}

export function listDeliveryCheckpoints(filter?: {
  projectId?: string;
  kind?: DeliveryCheckpointKind;
}): DeliveryCheckpoint[] {
  let result = [...checkpoints.values()];
  if (filter?.projectId) {
    const pid = filter.projectId.trim();
    result = result.filter((c) => c.projectId === pid);
  }
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCheckpoint);
}

export function clearDeliveryCheckpoints(): void {
  checkpoints.clear();
}
