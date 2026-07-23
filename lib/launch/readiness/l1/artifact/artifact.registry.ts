/**
 * Launch L1 — Artifact registry
 */

import { ARTIFACT_KINDS } from "../demo/demo.constants";
import { getProjectScenario } from "../project/project.scenario";
import type {
  ArtifactKind,
  DemoArtifact,
  RegisterArtifactInput,
} from "./artifact.types";

const artifacts = new Map<string, DemoArtifact>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneArtifact(artifact: DemoArtifact): DemoArtifact {
  return { ...artifact, metadata: { ...artifact.metadata } };
}

export function registerArtifact(
  input: RegisterArtifactInput,
): DemoArtifact {
  const name = input.name.trim();
  const projectId = input.projectId.trim();
  if (!name) throw new Error("artifact.name is required");
  if (!projectId) throw new Error("artifact.projectId is required");
  if (!getProjectScenario(projectId)) {
    throw new Error(`project not found: ${projectId}`);
  }
  if (!(ARTIFACT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid artifact kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("l1art");
  if (artifacts.has(id)) {
    throw new Error(`artifact already exists: ${id}`);
  }

  const uri =
    (input.uri ?? "").trim() ||
    `demo://artifacts/${projectId}/${input.kind.toLowerCase()}/${id}`;
  const now = nowIso();
  const artifact: DemoArtifact = {
    id,
    projectId,
    name,
    kind: input.kind,
    uri,
    detail: `kind=${input.kind} uri=${uri}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  artifacts.set(id, artifact);
  return cloneArtifact(artifact);
}

export function getArtifact(id: string): DemoArtifact | undefined {
  const artifact = artifacts.get(id.trim());
  return artifact ? cloneArtifact(artifact) : undefined;
}

export function listArtifacts(filter?: {
  projectId?: string;
  kind?: ArtifactKind;
}): DemoArtifact[] {
  let result = [...artifacts.values()];
  if (filter?.projectId) {
    const pid = filter.projectId.trim();
    result = result.filter((a) => a.projectId === pid);
  }
  if (filter?.kind) result = result.filter((a) => a.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneArtifact);
}

export function clearArtifacts(): void {
  artifacts.clear();
}
