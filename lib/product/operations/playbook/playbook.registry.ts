/**
 * Product Operations — Playbook registry
 */

import { OPS_PLAYBOOK_KINDS } from "../console/console.constants";
import { getOpsSurface } from "../surface/surface.registry";
import type {
  OpsPlaybook,
  OpsPlaybookKind,
  RegisterOpsPlaybookInput,
} from "./playbook.types";

const playbooks = new Map<string, OpsPlaybook>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePlaybook(playbook: OpsPlaybook): OpsPlaybook {
  return { ...playbook, metadata: { ...playbook.metadata } };
}

export function registerOpsPlaybook(
  input: RegisterOpsPlaybookInput,
): OpsPlaybook {
  const surfaceId = input.surfaceId.trim();
  const code = input.code.trim().toUpperCase();
  if (!surfaceId) throw new Error("playbook.surfaceId is required");
  if (!code) throw new Error("playbook.code is required");
  if (!(OPS_PLAYBOOK_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid playbook kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.steps) || input.steps < 1) {
    throw new Error("playbook.steps must be >= 1");
  }
  if (!getOpsSurface(surfaceId)) {
    throw new Error(`surface not found: ${surfaceId}`);
  }

  const duplicate = [...playbooks.values()].find((p) => p.code === code);
  if (duplicate) throw new Error(`playbook code already exists: ${code}`);

  const id = input.id?.trim() || createId("opspb");
  if (playbooks.has(id)) throw new Error(`playbook already exists: ${id}`);

  const playbook: OpsPlaybook = {
    id,
    surfaceId,
    code,
    kind: input.kind,
    steps: input.steps,
    detail: `kind=${input.kind} steps=${input.steps}`,
    metadata: { ...(input.metadata ?? {}) },
    registeredAt: nowIso(),
  };
  playbooks.set(id, playbook);
  return clonePlaybook(playbook);
}

export function getOpsPlaybook(id: string): OpsPlaybook | undefined {
  const playbook = playbooks.get(id.trim());
  return playbook ? clonePlaybook(playbook) : undefined;
}

export function listOpsPlaybooks(filter?: {
  surfaceId?: string;
  kind?: OpsPlaybookKind;
}): OpsPlaybook[] {
  let result = [...playbooks.values()];
  if (filter?.surfaceId) {
    const surfaceId = filter.surfaceId.trim();
    result = result.filter((p) => p.surfaceId === surfaceId);
  }
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePlaybook);
}

export function clearOpsPlaybooks(): void {
  playbooks.clear();
}
