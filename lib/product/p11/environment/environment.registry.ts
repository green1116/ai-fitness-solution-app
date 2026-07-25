/**
 * Product P11 — Environment registry
 */

import { ENVIRONMENT_KINDS } from "../release/release.constants";
import { getRelease } from "../release/release.registry";
import type {
  CreateEnvironmentInput,
  EnvironmentKind,
  ReleaseEnvironment,
} from "./environment.types";

const environments = new Map<string, ReleaseEnvironment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEnvironment(
  environment: ReleaseEnvironment,
): ReleaseEnvironment {
  return { ...environment, metadata: { ...environment.metadata } };
}

export function createEnvironment(
  input: CreateEnvironmentInput,
): ReleaseEnvironment {
  const releaseId = input.releaseId.trim();
  const name = input.name.trim();
  if (!releaseId) throw new Error("environment.releaseId is required");
  if (!name) throw new Error("environment.name is required");
  if (!(ENVIRONMENT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid environment kind: ${input.kind}`);
  }
  if (!getRelease(releaseId)) {
    throw new Error(`release not found: ${releaseId}`);
  }

  const id = input.id?.trim() || createId("p11env");
  if (environments.has(id)) {
    throw new Error(`environment already exists: ${id}`);
  }

  const region = (input.region ?? "us-east-1").trim() || "us-east-1";
  const environment: ReleaseEnvironment = {
    id,
    releaseId,
    kind: input.kind,
    name,
    region,
    detail: `kind=${input.kind} region=${region}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  environments.set(id, environment);
  return cloneEnvironment(environment);
}

export function getEnvironment(id: string): ReleaseEnvironment | undefined {
  const environment = environments.get(id.trim());
  return environment ? cloneEnvironment(environment) : undefined;
}

export function listEnvironments(filter?: {
  releaseId?: string;
  kind?: EnvironmentKind;
}): ReleaseEnvironment[] {
  let result = [...environments.values()];
  if (filter?.releaseId) {
    const rid = filter.releaseId.trim();
    result = result.filter((e) => e.releaseId === rid);
  }
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEnvironment);
}

export function clearEnvironments(): void {
  environments.clear();
}
