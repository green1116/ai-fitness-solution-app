/**
 * Commercialization P5 — Artifact registry
 */

import {
  ARTIFACT_KINDS,
  ARTIFACT_STATUSES,
} from "../delivery/delivery.constants";
import { getDeliveryPlan } from "../delivery/delivery.registry";
import { getDeliveryProject } from "../project/project.registry";
import type {
  ArtifactKind,
  ArtifactStatus,
  DeliveryArtifact,
  RegisterArtifactInput,
} from "./artifact.types";

const artifacts = new Map<string, DeliveryArtifact>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneArtifact(artifact: DeliveryArtifact): DeliveryArtifact {
  return { ...artifact, metadata: { ...artifact.metadata } };
}

export function registerArtifact(
  input: RegisterArtifactInput,
): DeliveryArtifact {
  const name = input.name.trim();
  const projectId = input.projectId.trim();
  const deliveryId = input.deliveryId.trim();
  if (!name) throw new Error("artifact.name is required");
  if (!(ARTIFACT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid artifact kind: ${input.kind}`);
  }

  const project = getDeliveryProject(projectId);
  if (!project) throw new Error(`project not found: ${projectId}`);
  const delivery = getDeliveryPlan(deliveryId);
  if (!delivery) throw new Error(`delivery plan not found: ${deliveryId}`);
  if (delivery.projectId !== projectId) {
    throw new Error(`artifact delivery/project mismatch`);
  }

  const id = input.id?.trim() || createId("art");
  if (artifacts.has(id)) {
    throw new Error(`artifact already exists: ${id}`);
  }

  const status: ArtifactStatus = "DRAFT";
  if (!(ARTIFACT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid artifact status: ${status}`);
  }

  const now = nowIso();
  const artifact: DeliveryArtifact = {
    id,
    projectId,
    deliveryId,
    name,
    kind: input.kind,
    version: (input.version ?? "1.0.0").trim() || "1.0.0",
    status,
    uri: (input.uri ?? `artifact://${id}`).trim() || `artifact://${id}`,
    detail: `kind=${input.kind} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  artifacts.set(id, artifact);
  return cloneArtifact(artifact);
}

export function setArtifactStatus(
  id: string,
  status: ArtifactStatus,
): DeliveryArtifact {
  const artifact = artifacts.get(id.trim());
  if (!artifact) throw new Error(`artifact not found: ${id}`);
  if (!(ARTIFACT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid artifact status: ${status}`);
  }
  artifact.status = status;
  artifact.updatedAt = nowIso();
  artifact.detail = `kind=${artifact.kind} status=${status}`;
  artifacts.set(artifact.id, artifact);
  return cloneArtifact(artifact);
}

export function getDeliveryArtifact(
  id: string,
): DeliveryArtifact | undefined {
  const artifact = artifacts.get(id.trim());
  return artifact ? cloneArtifact(artifact) : undefined;
}

export function listDeliveryArtifacts(filter?: {
  projectId?: string;
  deliveryId?: string;
  kind?: ArtifactKind;
  status?: ArtifactStatus;
}): DeliveryArtifact[] {
  let result = [...artifacts.values()];
  if (filter?.projectId) {
    const pid = filter.projectId.trim();
    result = result.filter((a) => a.projectId === pid);
  }
  if (filter?.deliveryId) {
    const did = filter.deliveryId.trim();
    result = result.filter((a) => a.deliveryId === did);
  }
  if (filter?.kind) result = result.filter((a) => a.kind === filter.kind);
  if (filter?.status) result = result.filter((a) => a.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneArtifact);
}

export function clearDeliveryArtifacts(): void {
  artifacts.clear();
}
