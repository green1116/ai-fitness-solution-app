/**
 * E12-P6 — Environment Profile
 */

import {
  ENVIRONMENT_PROFILE_KINDS,
  ENVIRONMENT_PROFILE_STATUSES,
} from "./deployment.constants";
import { getDeploymentPackage } from "./deployment.package";
import type {
  CreateEnvironmentProfileInput,
  EnvironmentProfile,
  EnvironmentProfileKind,
  EnvironmentProfileStatus,
} from "./deployment.types";

const profiles = new Map<string, EnvironmentProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProfile(profile: EnvironmentProfile): EnvironmentProfile {
  return {
    ...profile,
    variables: { ...profile.variables },
    metadata: { ...profile.metadata },
  };
}

export function createEnvironmentProfile(
  input: CreateEnvironmentProfileInput,
): EnvironmentProfile {
  const deploymentPackageId = input.deploymentPackageId.trim();
  const name = input.name.trim();
  const kind = input.kind;

  if (!name) throw new Error("environment.name is required");
  if (!getDeploymentPackage(deploymentPackageId)) {
    throw new Error(`deployment package not found: ${deploymentPackageId}`);
  }
  if (!(ENVIRONMENT_PROFILE_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid environment kind: ${kind}`);
  }

  const status = input.status ?? "ACTIVE";
  if (
    !(ENVIRONMENT_PROFILE_STATUSES as readonly string[]).includes(status)
  ) {
    throw new Error(`invalid environment status: ${status}`);
  }

  const id = input.id?.trim() || createId("env");
  if (profiles.has(id)) {
    throw new Error(`environment profile already exists: ${id}`);
  }

  const profile: EnvironmentProfile = {
    id,
    deploymentPackageId,
    kind,
    name,
    region: input.region?.trim() || "us-east-1",
    status,
    variables: { ...(input.variables ?? {}) },
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function getEnvironmentProfile(
  id: string,
): EnvironmentProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listEnvironmentProfiles(filter?: {
  deploymentPackageId?: string;
  kind?: EnvironmentProfileKind;
  status?: EnvironmentProfileStatus;
}): EnvironmentProfile[] {
  let result = [...profiles.values()];
  if (filter?.deploymentPackageId) {
    const pid = filter.deploymentPackageId.trim();
    result = result.filter((p) => p.deploymentPackageId === pid);
  }
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function clearEnvironmentProfiles(): void {
  profiles.clear();
}
