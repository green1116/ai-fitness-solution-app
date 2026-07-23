/**
 * Launch L4 — Artifact verify
 */

import { ARTIFACT_VERIFY_RESULTS } from "../scenario/scenario.constants";
import { getScenario } from "../scenario/scenario.registry";
import type {
  ArtifactVerification,
  DeliveryArtifact,
  RegisterDeliveryArtifactInput,
  VerifyArtifactInput,
} from "./artifact.types";

const artifacts = new Map<string, DeliveryArtifact>();
const verifications = new Map<string, ArtifactVerification>();

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

function cloneVerification(
  verification: ArtifactVerification,
): ArtifactVerification {
  return { ...verification };
}

export function registerDeliveryArtifact(
  input: RegisterDeliveryArtifactInput,
): DeliveryArtifact {
  const name = input.name.trim();
  const scenarioId = input.scenarioId.trim();
  if (!name) throw new Error("artifact.name is required");
  if (!scenarioId) throw new Error("artifact.scenarioId is required");
  if (!getScenario(scenarioId)) {
    throw new Error(`scenario not found: ${scenarioId}`);
  }

  const id = input.id?.trim() || createId("l4art");
  if (artifacts.has(id)) {
    throw new Error(`delivery artifact already exists: ${id}`);
  }

  const uri =
    (input.uri ?? "").trim() ||
    `delivery://artifacts/${scenarioId}/${id}`;
  const artifact: DeliveryArtifact = {
    id,
    scenarioId,
    name,
    uri,
    detail: `uri=${uri}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  artifacts.set(id, artifact);
  return cloneArtifact(artifact);
}

export function verifyDeliveryArtifact(
  input: VerifyArtifactInput,
): ArtifactVerification {
  const artifactId = input.artifactId.trim();
  if (!artifactId) throw new Error("verify.artifactId is required");
  if (!artifacts.has(artifactId)) {
    throw new Error(`delivery artifact not found: ${artifactId}`);
  }
  if (
    !(ARTIFACT_VERIFY_RESULTS as readonly string[]).includes(input.result)
  ) {
    throw new Error(`invalid artifact verify result: ${input.result}`);
  }

  const id = input.id?.trim() || createId("l4ver");
  if (verifications.has(id)) {
    throw new Error(`artifact verification already exists: ${id}`);
  }

  const notes = (input.notes ?? "").trim() || `result=${input.result}`;
  const verification: ArtifactVerification = {
    id,
    artifactId,
    result: input.result,
    notes,
    detail: `result=${input.result}`,
    verifiedAt: nowIso(),
  };
  verifications.set(id, verification);
  return cloneVerification(verification);
}

export function getDeliveryArtifact(
  id: string,
): DeliveryArtifact | undefined {
  const artifact = artifacts.get(id.trim());
  return artifact ? cloneArtifact(artifact) : undefined;
}

export function listDeliveryArtifacts(filter?: {
  scenarioId?: string;
}): DeliveryArtifact[] {
  let result = [...artifacts.values()];
  if (filter?.scenarioId) {
    const sid = filter.scenarioId.trim();
    result = result.filter((a) => a.scenarioId === sid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneArtifact);
}

export function listArtifactVerifications(filter?: {
  artifactId?: string;
}): ArtifactVerification[] {
  let result = [...verifications.values()];
  if (filter?.artifactId) {
    const aid = filter.artifactId.trim();
    result = result.filter((v) => v.artifactId === aid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneVerification);
}

export function clearDeliveryArtifacts(): void {
  verifications.clear();
  artifacts.clear();
}
